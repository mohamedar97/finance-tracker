"use server";

import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

interface UpdateAccountInput {
  accountId: string;
  name?: string;
  type?: string;
  balance?: string;
  currency?: string;
  isLiability?: boolean;
}

// Define a type for the update data that matches the possible fields
type AccountUpdateData = {
  name?: string;
  type?: string;
  balance?: string;
  currency?: string;
  isLiability?: boolean;
};

export async function updateAccount(data: UpdateAccountInput) {
  try {
    // Get the current user ID (this would typically come from an auth session)
    // For now, we'll use a placeholder - this should be replaced with actual auth logic
    // const userId = 1; // Placeholder - replace with actual user ID from auth

    // Prepare the update data
    const updateData: AccountUpdateData = {};

    // Only include fields that are provided
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.balance !== undefined) updateData.balance = data.balance;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.isLiability !== undefined)
      updateData.isLiability = data.isLiability;

    // Update the account
    const result = await db
      .update(accounts)
      .set(updateData)
      .where(
        eq(accounts.id, data.accountId),
        // In a real app, you would also check that the account belongs to the current user
        // .and(eq(accounts.user_id, userId))
      )
      .returning({ account_id: accounts.id });

    // Check if we have a valid account ID
    if (!result || result.length === 0 || !result[0]) {
      throw new Error(
        "Failed to update account: Account not found or not updated",
      );
    }

    // Revalidate the accounts page to reflect the changes
    revalidatePath("/accounts");

    return {
      success: true,
      accountId: result[0].account_id,
    };
  } catch (error) {
    console.error("Error updating account:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update account",
    };
  }
}
