"use server";

import { db } from "@/server/db";
import { transactions } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/server/auth";
import { Transaction } from "@/lib/types";
import { revalidateTag } from "next/cache";
import { updateAccountBalance } from "@/server/actions/accounts/updateAccountBalance";

/**
 * Updates an existing transaction
 * @param transactionData Transaction data including id to update
 * @returns The updated transaction and success status
 */
export async function updateTransaction(
  transactionData: Partial<Transaction> & { id: string },
) {
  try {
    // Get the current user ID from auth session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { id, ...updateData } = transactionData;

    // First, get the original transaction to compare changes
    const [originalTransaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

    if (!originalTransaction) {
      return {
        success: false,
        transaction: null,
        error: "Transaction not found or not authorized",
      };
    }

    // Format date if provided
    if (updateData.transactionDate) {
      updateData.transactionDate = new Date(
        updateData.transactionDate,
      ).toISOString();
    }

    // Update the transaction, ensuring it belongs to the current user
    const [updatedTransaction] = await db
      .update(transactions)
      .set(updateData)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();

    if (!updatedTransaction) {
      return {
        success: false,
        transaction: null,
        error: "Transaction not found or not authorized",
      };
    }

    // Check if we need to update the account balance
    const needsBalanceUpdate =
      updateData.amount !== undefined ||
      updateData.transactionType !== undefined ||
      updateData.accountId !== undefined;

    if (needsBalanceUpdate) {
      // If the account has changed, we need to update both accounts
      if (
        updateData.accountId &&
        updateData.accountId !== originalTransaction.accountId
      ) {
        // First, reverse the effect on the original account
        await updateAccountBalance({
          accountId: originalTransaction.accountId,
          amount: originalTransaction.amount,
          transactionType: originalTransaction.transactionType,
          isAdding: false,
          createTransaction: false,
        });

        // Then add the effect to the new account
        await updateAccountBalance({
          accountId: updatedTransaction.accountId,
          amount: updatedTransaction.amount,
          transactionType: updatedTransaction.transactionType,
          isAdding: true,
          createTransaction: false,
        });
      } else {
        // If it's the same account but amount or type changed,
        // first reverse the original transaction effect
        await updateAccountBalance({
          accountId: originalTransaction.accountId,
          amount: originalTransaction.amount,
          transactionType: originalTransaction.transactionType,
          isAdding: false,
          createTransaction: false,
        });

        // Then add the new transaction effect
        await updateAccountBalance({
          accountId: updatedTransaction.accountId,
          amount: updatedTransaction.amount,
          transactionType: updatedTransaction.transactionType,
          isAdding: true,
          createTransaction: false,
        });
      }
    }

    // Revalidate the transactions page
    revalidateTag("transactions");
    // Also revalidate the accounts page
    revalidateTag("accounts");

    return {
      success: true,
      transaction: updatedTransaction as Transaction,
    };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return {
      success: false,
      transaction: null,
      error:
        error instanceof Error ? error.message : "Failed to update transaction",
    };
  }
}
