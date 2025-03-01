"use server";

import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Currency, Account } from "@/lib/types";

/**
 * Updates an account's balance based on transaction data
 * @param accountId The account ID to update
 * @param amount The transaction amount
 * @param transactionType 'Income' or 'Expense'
 * @param isAdding Whether we're adding (true) or removing (false) this transaction's effect
 * @returns Success status and the updated account balance
 */
export async function updateAccountBalance(
  accountId: string,
  amount: string | number,
  transactionType: "Income" | "Expense",
  isAdding: boolean,
) {
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

    // For expenses, we subtract from the balance
    if (transactionType === "Expense") {
      balanceAdjustment = -numericAmount;
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
