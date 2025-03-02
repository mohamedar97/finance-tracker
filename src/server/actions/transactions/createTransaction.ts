"use server";

import { db } from "@/server/db";
import { transactions } from "@/server/db/schema";
import { auth } from "@/server/auth";
import { NewTransaction, Transaction } from "@/lib/types";
import { revalidateTag } from "next/cache";
import { updateAccountBalance } from "@/server/actions/accounts/updateAccountBalance";

/**
 * Creates a new transaction for the current user
 * @param transactionData Data for the new transaction
 * @returns The created transaction and success status
 */
export async function createTransaction(transactionData: NewTransaction) {
  try {
    // Get the current user ID from auth session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Add the user ID to the transaction data
    const newTransactionData = {
      ...transactionData,
      userId,
      transactionDate: new Date(transactionData.transactionDate).toISOString(),
    };

    // Insert the new transaction
    const result = await db
      .insert(transactions)
      .values(newTransactionData)
      .returning();

    if (!result || result.length === 0) {
      throw new Error("Failed to create transaction");
    }

    const transaction = result[0] as Transaction;

    // Update the account balance based on the transaction
    const balanceResult = await updateAccountBalance({
      accountId: transaction.accountId,
      amount: transaction.amount,
      transactionType: transaction.transactionType,
      isAdding: true,
      createTransaction: false,
    });

    if (!balanceResult.success) {
      console.error("Failed to update account balance:", balanceResult.error);
      // We still return success for the transaction but log the balance update error
    }

    // Revalidate the transactions page
    revalidateTag("transactions");
    // Also revalidate the accounts page to reflect the updated balance
    revalidateTag("accounts");

    return {
      success: true,
      transaction: transaction,
    };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return {
      success: false,
      transaction: null,
      error:
        error instanceof Error ? error.message : "Failed to create transaction",
    };
  }
}
