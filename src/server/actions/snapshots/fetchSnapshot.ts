"use server";

import {
  accounts,
  snapshots,
  snapshotDetails,
  currencyRates,
} from "@/server/db/schema";
import { db } from "@/server/db";
import { desc, eq, and, sql } from "drizzle-orm";
import { auth } from "@/server/auth";

// Interface defining the structure of historical metrics
export interface HistoricalMetrics {
  liquidAssets: number;
  savings: number;
  liabilities: number;
  totalAssets: number;
  netTotal: number;
}

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

  // Get the snapshot details for the previous snapshot
  const previousSnapshotDetails = await db.query.snapshotDetails.findMany({
    where: eq(snapshotDetails.snapshotId, previousSnapshot.id),
  });

  if (previousSnapshotDetails.length === 0) {
    return null;
  }

  // Get the currency rates at the time of the previous snapshot
  const previousRates = await db.query.currencyRates.findFirst({
    where: eq(currencyRates.id, previousSnapshot.currencyRateId || 0),
  });

  if (!previousRates) {
    return null;
  }

  // Get historical account data for the snapshot
  const previousAccounts = await Promise.all(
    previousSnapshotDetails.map(async (detail) => {
      return db.query.accounts.findFirst({
        where: eq(accounts.id, detail.accountId),
      });
    }),
  );

  // Filter out null values
  const validPreviousAccounts = previousAccounts.filter(Boolean);

  // Initialize historical metrics
  let previousLiquidAssets = 0;
  let previousSavings = 0;
  let previousLiabilities = 0;

  // Process historical accounts
  for (const account of validPreviousAccounts) {
    if (!account) continue;

    // Convert all currencies to EGP for consistent calculations
    let balanceInEGP = 0;

    if (account.currency === "USD") {
      balanceInEGP = Number(account.balance) * Number(previousRates.usdRate);
    } else if (account.currency === "EGP") {
      balanceInEGP = Number(account.balance);
    } else if (account.currency === "Gold") {
      // Convert gold directly to EGP
      balanceInEGP = Number(account.balance) * Number(previousRates.goldGrate);
    }

    if (account.isLiability) {
      previousLiabilities += balanceInEGP;
    } else if (account.type === "Savings") {
      previousSavings += balanceInEGP;
    } else {
      previousLiquidAssets += balanceInEGP;
    }
  }

  const previousTotalAssets = previousLiquidAssets + previousSavings;
  const previousNetTotal = previousTotalAssets - previousLiabilities;

  return {
    liquidAssets: previousLiquidAssets,
    savings: previousSavings,
    liabilities: previousLiabilities,
    totalAssets: previousTotalAssets,
    netTotal: previousNetTotal,
  };
}
