"use server";

import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/server/auth";

export async function deleteAccount(accountId: string) {
  try {
    // Get the current user ID (this would typically come from an auth session)
    // For now, we'll use a placeholder - this should be replaced with actual auth logic
    const session = await auth();

    // Get the current user ID (this would typically come from an auth session)
    // For now, we'll use a placeholder - this should be replaced with actual auth logic
    const userId = session?.user?.id; // Placeholder - replace with actual user ID from auth
    if (!userId) {
      throw new Error("User not authenticated");
    }
    // Delete the account
    const result = await db
      .delete(accounts)
      .where(eq(accounts.id, accountId))
      .returning();

    // Check if we have a valid result
    if (!result || result.length === 0) {
      throw new Error("Failed to delete account: Account not found");
    }

    // Revalidate the accounts page to reflect the changes
    revalidateTag("accounts");

    return {
      success: true,
      account: result[0],
    };
  } catch (error) {
    console.error("Error deleting account:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete account",
    };
  }
}
