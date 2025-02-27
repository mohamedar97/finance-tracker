"use server";

import { snapshots, currencyRates } from "@/server/db/schema";
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
    // Since metrics are now stored directly in the snapshots table,
    // we can use them without additional queries

    const liquidAssets = Number(snapshot.liquidAssets);
    const savings = Number(snapshot.savings);
    const liabilities = Number(snapshot.liabilities);
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
      },
    });
  }

  return dataPoints;
}
