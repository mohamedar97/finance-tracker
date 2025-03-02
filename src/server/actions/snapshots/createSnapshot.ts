"use server";

import { db } from "@/server/db";
import {
  snapshots,
  currencyRates,
  accounts,
  snapshotsAccounts,
} from "@/server/db/schema";
import { auth } from "@/server/auth";
import { desc, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

/**
 * Creates a new financial snapshot for a user
 * Automatically uses the latest currency rate, current account balances, and today's date
 */
export async function createSnapshot() {
  try {
    const session = await auth();

    // Get the current user ID from the session
    const userId = session?.user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get the latest currency rate
    const latestRate = await db.query.currencyRates.findFirst({
      orderBy: [desc(currencyRates.createdAt)],
    });

    if (!latestRate) {
      throw new Error("No currency rates found in the database");
    }

    // Get today's date in YYYY-MM-DD format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    // Insert the snapshot with the latest currency rate
    const result = await db
      .insert(snapshots)
      .values({
        userId,
        snapshotDate: today,
        currencyRateId: latestRate.id,
      })
      .returning();

    // Check if we have a valid snapshot
    if (!result || result.length === 0 || !result[0]) {
      throw new Error("Failed to create snapshot: No snapshot returned");
    }

    const snapshotId = result[0].id;

    // Get all accounts for the user
    const userAccounts = await db.query.accounts.findMany({
      where: eq(accounts.userId, userId),
    });

    // Create snapshot account entries for each account
    const snapshotAccountsData = userAccounts.map((account) => ({
      snapshotId,
      accountId: account.id,
      name: account.name,
      type: account.type,
      isLiability: account.isLiability,
      balance: account.balance,
      currency: account.currency,
    }));

    // Insert the snapshot accounts data if there are accounts
    if (snapshotAccountsData.length > 0) {
      await db.insert(snapshotsAccounts).values(snapshotAccountsData);
    }

    // Revalidate the relevant paths to reflect the changes
    revalidateTag("snapshots");

    return {
      success: true,
      snapshot: result[0],
    };
  } catch (error) {
    console.error("Error creating snapshot:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create snapshot",
    };
  }
}
