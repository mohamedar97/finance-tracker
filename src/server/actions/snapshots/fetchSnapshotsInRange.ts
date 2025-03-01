"use server";

import {
  snapshots,
  currencyRates,
  snapshotsAccounts,
} from "@/server/db/schema";
import { db } from "@/server/db";
import { desc, eq, and, sql } from "drizzle-orm";
import { auth } from "@/server/auth";
import { SnapshotDataPoint } from "@/lib/types";

/**
 * Represents a single data point for charting purposes
 */

/**
 * Fetches snapshots within a date range to display financial metrics over time
 * @param startDate The beginning of the date range (defaults to 6 months ago)
 * @param endDate The end of the date range (defaults to current date)
 * @returns Array of data points containing dates and corresponding metrics
 */
export async function fetchSnapshotsInRange(
  startDate?: Date,
  endDate?: Date,
): Promise<SnapshotDataPoint[]> {
  // Get current user session
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized access");
  }

  const userId = session.user.id;

  // Set default date range if not provided (6 months)
  const end = endDate || new Date();
  const start = startDate || new Date(end);
  if (!startDate) {
    start.setMonth(start.getMonth() - 6);
  }

  // Format dates for comparison
  const formattedStartDate = start.toISOString().split("T")[0];
  const formattedEndDate = end.toISOString().split("T")[0];

  // Find all snapshots within the date range
  const rangeSnapshots = await db.query.snapshots.findMany({
    where: and(
      eq(snapshots.userId, userId),
      sql`${snapshots.snapshotDate} >= ${formattedStartDate}`,
      sql`${snapshots.snapshotDate} <= ${formattedEndDate}`,
    ),
    orderBy: [snapshots.snapshotDate],
  });

  // If no snapshots exist, return empty array
  if (rangeSnapshots.length === 0) {
    return [];
  }

  // Process each snapshot to get metrics
  const dataPoints: SnapshotDataPoint[] = [];

  for (const snapshot of rangeSnapshots) {
    // Get all snapshot account entries for this snapshot
    const snapshotAccountEntries = await db.query.snapshotsAccounts.findMany({
      where: eq(snapshotsAccounts.snapshotId, snapshot.id),
    });

    if (!snapshotAccountEntries.length) {
      continue; // Skip this snapshot if no account data exists
    }

    // Fetch currency rates if they exist
    const rateData = await db.query.currencyRates.findFirst({
      where: eq(currencyRates.id, snapshot.currencyRateId),
    });

    const usdRate = rateData ? Number(rateData.usdRate) : 0;
    const goldRate = rateData ? Number(rateData.goldGrate) : 0;

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

      // Check if this is a liability account
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

    // Add data point to results
    dataPoints.push({
      date: new Date(snapshot.snapshotDate),
      metrics: {
        liquidAssets,
        savings,
        liabilities,
        totalAssets,
        netTotal,
        usdRate,
        goldRate,
      },
    });
  }

  return dataPoints;
}
