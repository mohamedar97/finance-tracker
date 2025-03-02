"use server";

import { db } from "@/server/db";
import { accounts, transactions } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Currency, Account } from "@/lib/types";
import { auth } from "@/server/auth";
import { revalidateTag } from "next/cache";

/**
 * Updates an account's balance based on transaction data.
 * This function can optionally create a transaction record for the balance update.
 * @param accountId The account ID to update
 * @param amount The transaction amount
 * @param transactionType 'Income' or 'Expense'
 * @param isAdding Whether we're adding (true) or removing (false) this transaction's effect
 * @param createTransaction Whether to create a transaction record for this balance update (default: false)
 * @param transactionDetails Optional details for the transaction record if createTransaction is true
 * @returns Success status and the updated account balance
 */
export async function updateAccountBalance({
  accountId,
  amount,
  transactionType,
  isAdding,
  createTransaction = false,
  transactionDetails = {
    payee: "Balance Adjustment",
    description: "Balance Adjustment",
    category: "Adjustment",
    transactionDate: new Date(),
  },
}: {
  accountId: string;
  amount: string | number;
  transactionType: "Income" | "Expense";
  isAdding: boolean;
  createTransaction?: boolean;
  transactionDetails?: {
    payee?: string;
    description?: string;
    category?: string;
    transactionDate?: Date;
  };
}) {
  try {
    // Convert amount to number if it's a string
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;

    // Get the current account
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId));

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate the balance adjustment
    let balanceAdjustment = numericAmount;

    if (account.isLiability) {
      // For liability accounts, the effect is reversed
      // Income reduces liability, Expense increases liability
      if (transactionType === "Income") {
        balanceAdjustment = -numericAmount;
      }
      // For Expense, keep the positive adjustment
    } else {
      // For regular accounts
      // Income increases balance, Expense decreases balance
      if (transactionType === "Expense") {
        balanceAdjustment = -numericAmount;
      }
      // For Income, keep the positive adjustment
    }

    // If we're removing a transaction's effect, reverse the adjustment
    if (!isAdding) {
      balanceAdjustment = -balanceAdjustment;
    }

    // Calculate the new balance
    const currentBalance = parseFloat(account.balance.toString());
    const newBalance = currentBalance + balanceAdjustment;

    // Update the account balance
    const result = await db
      .update(accounts)
      .set({ balance: newBalance.toString() })
      .where(eq(accounts.id, accountId))
      .returning();

    if (!result || result.length === 0) {
      throw new Error("Failed to update account balance");
    }

    const updatedAccount = result[0] as Account;

    // Create a transaction record if requested
    // Only create transaction when adding (not removing) an effect
    if (createTransaction && isAdding) {
      // Get the current user ID from auth session
      const session = await auth();
      const userId = session?.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Create the transaction
      await db.insert(transactions).values({
        userId,
        accountId,
        currency: account.currency,
        transactionType,
        amount: numericAmount.toString(),
        payee: transactionDetails?.payee || "Account Balance Adjustment",
        description:
          transactionDetails?.description || "Manual balance adjustment",
        category: transactionDetails?.category || "Adjustment",
        transactionDate: transactionDetails?.transactionDate
          ? new Date(transactionDetails.transactionDate).toISOString()
          : new Date().toISOString(),
      });

      // Revalidate the transactions page
    }
    revalidateTag("transactions");

    // Revalidate the accounts page
    revalidateTag("accounts");

    return {
      success: true,
      newBalance: updatedAccount.balance,
    };
  } catch (error) {
    console.error("Error updating account balance:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update account balance",
    };
  }
}
