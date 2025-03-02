"use server";

import { db } from "@/server/db";
import { accounts, transactions } from "@/server/db/schema";
import { auth } from "@/server/auth";
import { eq } from "drizzle-orm";
import { convertCurrency } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { NewTransaction } from "@/lib/types";

interface TransferData {
  fromAccountId: string;
  toAccountId: string;
  amount: string | number;
  currency: string;
  description?: string;
  usdRate?: number;
  goldRate?: number;
}

/**
 * Transfers money between two accounts, creating two transactions
 * @param transferData Data for the transfer
 * @returns Success status and the created transactions
 */
export async function transferBetweenAccounts(transferData: TransferData) {
  try {
    // Get the current user ID from auth session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const {
      fromAccountId,
      toAccountId,
      amount,
      currency,
      description = "",
      usdRate = 60, // Default USD to EGP rate
      goldRate = 3500, // Default Gold (per gram) to EGP rate
    } = transferData;

    if (fromAccountId === toAccountId) {
      throw new Error("Cannot transfer to the same account");
    }

    // Convert amount to number if it's a string
    const transferAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(transferAmount) || transferAmount <= 0) {
      throw new Error("Invalid transfer amount");
    }

    // Fetch the source and destination accounts
    const [fromAccount] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, fromAccountId));

    const [toAccount] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, toAccountId));

    if (!fromAccount || !toAccount) {
      throw new Error("One or both accounts not found");
    }

    // Convert the transfer amount from specified currency to source account currency
    // Using the provided rates or defaults

    // Convert amount from transfer currency to source account currency
    const sourceAmount = convertCurrency(
      transferAmount,
      currency,
      fromAccount.currency,
      usdRate,
      goldRate,
    );

    // Convert the same amount to destination account currency
    const destinationAmount = convertCurrency(
      transferAmount,
      currency,
      toAccount.currency,
      usdRate,
      goldRate,
    );

    // Check if source account has sufficient balance
    const currentSourceBalance = parseFloat(fromAccount.balance.toString());
    if (currentSourceBalance < sourceAmount) {
      throw new Error("Insufficient balance in source account");
    }

    // Generate a transaction date (today)
    const transactionDate = new Date().toISOString().split("T")[0];

    // Start a transaction to ensure both transfers are atomic
    return await db.transaction(async (tx) => {
      // 1. Create withdrawal transaction from source account
      const withdrawalData: NewTransaction = {
        userId,
        accountId: fromAccountId,
        payee: `Transfer to ${toAccount.name}`,
        amount: sourceAmount.toString(),
        currency: fromAccount.currency,
        transactionType: "Expense",
        description:
          `Transfer to ${toAccount.name}${description ? ": " + description : ""}` ||
          "",
        category: "Transfer",
        transactionDate: transactionDate!,
      };

      const withdrawalResult = await tx
        .insert(transactions)
        .values(withdrawalData)
        .returning();

      if (!withdrawalResult || withdrawalResult.length === 0) {
        throw new Error("Failed to create withdrawal transaction");
      }

      // 2. Create deposit transaction to destination account
      const depositData: NewTransaction = {
        userId,
        accountId: toAccountId,
        payee: `Transfer from ${fromAccount.name}`,
        amount: destinationAmount.toString(),
        currency: toAccount.currency,
        transactionType: "Income",
        description:
          `Transfer from ${fromAccount.name}${description ? ": " + description : ""}` ||
          "",
        category: "Transfer",
        transactionDate: transactionDate!,
      };

      const depositResult = await tx
        .insert(transactions)
        .values(depositData)
        .returning();

      if (!depositResult || depositResult.length === 0) {
        throw new Error("Failed to create deposit transaction");
      }

      // 3. Update source account balance
      let newSourceBalance: number;

      if (fromAccount.isLiability) {
        // For liability accounts, add the amount when money is leaving
        newSourceBalance = currentSourceBalance + sourceAmount;
      } else {
        // For regular accounts, subtract the amount as before
        newSourceBalance = currentSourceBalance - sourceAmount;
      }

      await tx
        .update(accounts)
        .set({ balance: newSourceBalance.toString() })
        .where(eq(accounts.id, fromAccountId));

      // 4. Update destination account balance
      const currentDestBalance = parseFloat(toAccount.balance.toString());

      let newDestBalance: number;
      let updateFields: { balance: string; isLiability?: boolean } = {
        balance: "0", // This will be updated below
      };

      // Track if the destination liability status changed
      let destinationLiabilityChanged = false;

      if (toAccount.isLiability) {
        // For liability accounts, subtract the amount instead of adding
        newDestBalance = currentDestBalance - destinationAmount;

        // If the transfer amount exceeds the liability balance
        if (newDestBalance < 0) {
          // Convert to a regular account with the positive difference as balance
          newDestBalance = Math.abs(newDestBalance);
          updateFields = {
            balance: newDestBalance.toString(),
            isLiability: false,
          };
          destinationLiabilityChanged = true;
        } else {
          // Regular liability account balance update
          updateFields = {
            balance: newDestBalance.toString(),
          };
        }
      } else {
        // For regular accounts, add the amount as before
        newDestBalance = currentDestBalance + destinationAmount;
        updateFields = {
          balance: newDestBalance.toString(),
        };
      }

      await tx
        .update(accounts)
        .set(updateFields)
        .where(eq(accounts.id, toAccountId));

      // Revalidate paths
      revalidatePath("/accounts");
      revalidatePath("/transactions");

      return {
        success: true,
        sourceTransaction: withdrawalResult[0],
        destinationTransaction: depositResult[0],
        newSourceBalance: newSourceBalance.toString(),
        newDestinationBalance: newDestBalance.toString(),
        destinationLiabilityChanged,
      };
    });
  } catch (error) {
    console.error("Error transferring between accounts:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to transfer between accounts",
      sourceTransaction: undefined,
      destinationTransaction: undefined,
      newSourceBalance: "",
      newDestinationBalance: "",
      destinationLiabilityChanged: false,
    };
  }
}
