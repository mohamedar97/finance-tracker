"use server";

import {
  snapshots,
  currencyRates,
  snapshotsAccounts,
} from "@/server/db/schema";
import { db } from "@/server/db";
import { desc, eq, and, sql } from "drizzle-orm";
import { auth } from "@/server/auth";
import { HistoricalMetrics } from "@/lib/types";

// Interface defining the structure of historical metrics

/**
 * Fetches historical snapshot data from a specific date
 * @param daysAgo Number of days in the past to fetch data from
 * @returns Historical metrics data or null if no data is available
 */
export async function fetchSnapshot(
  daysAgo = 30,
): Promise<HistoricalMetrics | null> {
  // Get current user session
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized access");
  }

  const userId = session.user.id;

  // Calculate the date for comparison
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - daysAgo);
  const formattedDate = targetDate.toISOString().split("T")[0];

  // Find the most recent snapshot before the target date
  const previousSnapshot = await db.query.snapshots.findFirst({
    where: and(
      eq(snapshots.userId, userId),
      sql`${snapshots.snapshotDate} <= ${formattedDate}`,
    ),
    orderBy: [desc(snapshots.snapshotDate)],
  });

  // If no snapshot exists, return null
  if (!previousSnapshot) {
    return null;
  }

  // Get the currency rates at the time of the previous snapshot
  const previousRates = await db.query.currencyRates.findFirst({
    where: eq(currencyRates.id, previousSnapshot.currencyRateId || 0),
  });

  if (!previousRates) {
    return null;
  }

  // Get all snapshot account entries for this snapshot
  const snapshotAccountEntries = await db.query.snapshotsAccounts.findMany({
    where: eq(snapshotsAccounts.snapshotId, previousSnapshot.id),
  });

  if (!snapshotAccountEntries.length) {
    return null;
  }

  // Get the currency rates for conversion
  const usdRate = Number(previousRates.usdRate);
  const goldRate = Number(previousRates.goldGrate);

  // Calculate metrics based on account types - using values directly from snapshotsAccounts
  // All values will be standardized to EGP
  let liquidAssets = 0;
  let savings = 0;
  let liabilities = 0;

  for (const entry of snapshotAccountEntries) {
    let balance = Number(entry.balance);

    // Convert balance to EGP based on currency
    if (entry.currency === "USD" && usdRate > 0) {
      balance = balance * usdRate; // Convert USD to EGP
    } else if (entry.currency === "Gold" && goldRate > 0) {
      balance = balance * goldRate; // Convert Gold to EGP
    }
    // If currency is already EGP or rates are missing, use the balance as is

    // Check if this is a liability account - using isLiability directly from snapshotsAccounts
    if (entry.isLiability) {
      liabilities += balance;
    } else {
      // Not a liability, so it's an asset
      if (entry.type === "Savings") {
        savings += balance;
      } else {
        // Assuming all non-savings accounts are liquid assets
        liquidAssets += balance;
      }
    }
  }

  // Calculate totals (all in EGP)
  const totalAssets = liquidAssets + savings;
  const netTotal = totalAssets - liabilities;

  return {
    liquidAssets,
    savings,
    liabilities,
    totalAssets,
    netTotal,
    usdRate,
    goldRate,
  };
}
