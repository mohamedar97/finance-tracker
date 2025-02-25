"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
import { revalidatePath } from "next/cache";

interface CreateAccountInput {
  name: string;
  type: string;
  balance: string;
  currency: string;
  isLiability: boolean;
}

export async function createAccount(data: CreateAccountInput) {
  try {
    const session = await auth();

    // Get the current user ID (this would typically come from an auth session)
    // For now, we'll use a placeholder - this should be replaced with actual auth logic
    const userId = session?.user?.id; // Placeholder - replace with actual user ID from auth
    if (!userId) {
      throw new Error("User not authenticated");
    }
    // Insert the account
    const result = await db
      .insert(accounts)
      .values({
        userId: userId,
        name: data.name,
        currency: data.currency as "USD" | "EGP" | "Gold",
        balance: data.balance,
        type: data.type as "savings" | "checking",
        isLiability: data.isLiability,
      })
      .returning();

    // Check if we have a valid account ID
    if (!result || result.length === 0 || !result[0]) {
      throw new Error("Failed to create account: No account ID returned");
    }

    // Revalidate the accounts page to reflect the changes
    revalidatePath("/accounts");

    return {
      success: true,
      account: result[0],
    };
  } catch (error) {
    console.error("Error creating account:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create account",
    };
  }
}
