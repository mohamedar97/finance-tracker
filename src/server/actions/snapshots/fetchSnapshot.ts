"use server";

import { accounts, snapshots, currencyRates } from "@/server/db/schema";
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

  // Now that the metrics are directly stored in the snapshots table,
  // we can return them without additional processing
  return {
    liquidAssets: Number(previousSnapshot.liquidAssets),
    savings: Number(previousSnapshot.savings),
    liabilities: Number(previousSnapshot.liabilities),
    totalAssets:
      Number(previousSnapshot.liquidAssets) + Number(previousSnapshot.savings),
    netTotal:
      Number(previousSnapshot.liquidAssets) +
      Number(previousSnapshot.savings) -
      Number(previousSnapshot.liabilities),
  };
}
