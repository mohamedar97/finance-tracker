"use server";

import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import type { Account } from "@/lib/types";

/**
 * Fetches all accounts for the current user
 * @returns An array of accounts and success status
 */
export async function getAccounts() {
  try {
    // Get the current user ID (this would typically come from an auth session)
    // For now, we'll use a placeholder - this should be replaced with actual auth logic
    const userId = 1; // Placeholder - replace with actual user ID from auth

    // Query all accounts for the user
    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));

    return {
      success: true,
      accounts: userAccounts,
    };
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return {
      success: false,
      accounts: [],
      error:
        error instanceof Error ? error.message : "Failed to fetch accounts",
    };
  }
}

/**
 * Fetches a single account by ID
 * @param accountId The UUID of the account to fetch
 * @returns The account and success status
 */
export async function getAccountById(accountId: string) {
  try {
    // Get the current user ID (this would typically come from an auth session)
    // For now, we'll use a placeholder - this should be replaced with actual auth logic
    const userId = 1; // Placeholder - replace with actual user ID from auth

    // Query the specific account, ensuring it belongs to the current user
    const [account] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));

    if (!account) {
      return {
        success: false,
        account: null,
        error: "Account not found",
      };
    }

    return {
      success: true,
      account: account as Account,
    };
  } catch (error) {
    console.error("Error fetching account:", error);
    return {
      success: false,
      account: null,
      error: error instanceof Error ? error.message : "Failed to fetch account",
    };
  }
}
