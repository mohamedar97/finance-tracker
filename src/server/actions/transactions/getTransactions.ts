"use server";

import { db } from "@/server/db";
import { transactions, accounts } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import type { Transaction } from "@/lib/types";
import { auth } from "@/server/auth";

/**
 * Fetches all transactions for the current user
 * @returns An array of transactions and success status
 */
export async function getTransactions() {
  try {
    // Get the current user ID from auth session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Query all transactions for the user with account names
    const userTransactions = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        accountId: transactions.accountId,
        currencyRateId: transactions.currencyRateId,
        payee: transactions.payee,
        currency: transactions.currency,
        transactionType: transactions.transactionType,
        amount: transactions.amount,
        description: transactions.description,
        category: transactions.category,
        createdAt: transactions.createdAt,
        transactionDate: transactions.transactionDate,
        accountName: accounts.name,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(eq(transactions.userId, userId));

    return {
      success: true,
      transactions: userTransactions,
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      success: false,
      transactions: [],
      error:
        error instanceof Error ? error.message : "Failed to fetch transactions",
    };
  }
}

/**
 * Fetches a single transaction by ID
 * @param transactionId The UUID of the transaction to fetch
 * @returns The transaction and success status
 */
export async function getTransactionById(transactionId: string) {
  try {
    // Get the current user ID from auth session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Query the specific transaction, ensuring it belongs to the current user
    const [transaction] = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        accountId: transactions.accountId,
        currencyRateId: transactions.currencyRateId,
        payee: transactions.payee,
        currency: transactions.currency,
        transactionType: transactions.transactionType,
        amount: transactions.amount,
        description: transactions.description,
        category: transactions.category,
        createdAt: transactions.createdAt,
        transactionDate: transactions.transactionDate,
        accountName: accounts.name,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId),
        ),
      );

    if (!transaction) {
      return {
        success: false,
        transaction: null,
        error: "Transaction not found",
      };
    }

    return {
      success: true,
      transaction: transaction as Transaction,
    };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return {
      success: false,
      transaction: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch transaction",
    };
  }
}

/**
 * Fetches transactions for a specific account
 * @param accountId The UUID of the account to fetch transactions for
 * @returns An array of transactions and success status
 */
export async function getTransactionsByAccountId(accountId: string) {
  try {
    // Get the current user ID from auth session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Query transactions for the specific account, ensuring it belongs to the current user
    const accountTransactions = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        accountId: transactions.accountId,
        currencyRateId: transactions.currencyRateId,
        payee: transactions.payee,
        currency: transactions.currency,
        transactionType: transactions.transactionType,
        amount: transactions.amount,
        description: transactions.description,
        category: transactions.category,
        createdAt: transactions.createdAt,
        transactionDate: transactions.transactionDate,
        accountName: accounts.name,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(
          eq(transactions.accountId, accountId),
          eq(transactions.userId, userId),
        ),
      );

    return {
      success: true,
      transactions: accountTransactions,
    };
  } catch (error) {
    console.error("Error fetching account transactions:", error);
    return {
      success: false,
      transactions: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch account transactions",
    };
  }
}
