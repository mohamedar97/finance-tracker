"use server";

import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/server/auth";
import { Account } from "@/lib/types";

/**
 * Fetches a single account by ID
 * @param accountId The UUID of the account to fetch
 * @returns The account and success status
 */
export async function getAccountById(accountId: string) {
  try {
    // Get the current user ID from auth session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

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
