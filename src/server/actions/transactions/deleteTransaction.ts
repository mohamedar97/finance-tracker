"use server";

import { db } from "@/server/db";
import { transactions } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/server/auth";
import { revalidateTag } from "next/cache";
import { updateAccountBalance } from "@/server/actions/accounts/updateAccountBalance";

/**
 * Deletes a transaction
 * @param transactionId The UUID of the transaction to delete
 * @returns Success status and error message if any
 */
export async function deleteTransaction(transactionId: string) {
  try {
    // Get the current user ID from auth session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // First, get the transaction to be deleted so we can update the account balance
    const [transactionToDelete] = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId),
        ),
      );

    if (!transactionToDelete) {
      return {
        success: false,
        error: "Transaction not found or not authorized to delete",
      };
    }

    // Delete the transaction, ensuring it belongs to the current user
    const result = await db
      .delete(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId),
        ),
      )
      .returning({ id: transactions.id });

    if (result.length === 0) {
      return {
        success: false,
        error: "Transaction not found or not authorized to delete",
      };
    }

    // Update the account balance by reversing the transaction effect
    const balanceResult = await updateAccountBalance({
      accountId: transactionToDelete.accountId,
      amount: transactionToDelete.amount,
      transactionType: transactionToDelete.transactionType,
      isAdding: false,
      createTransaction: false,
    });

    if (!balanceResult.success) {
      console.error("Failed to update account balance:", balanceResult.error);
      // We still return success for the deletion but log the balance update error
    }

    // Revalidate the transactions page
    revalidateTag("transactions");
    // Also revalidate the accounts page
    revalidateTag("accounts");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete transaction",
    };
  }
}
