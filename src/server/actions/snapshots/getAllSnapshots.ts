"use server";

import {
  snapshots,
  currencyRates,
  snapshotsAccounts,
} from "@/server/db/schema";
import { db } from "@/server/db";
import { desc, eq, and, inArray, sql } from "drizzle-orm";
import { auth } from "@/server/auth";
import { HistorySnapshot } from "@/lib/types";
import { InferSelectModel } from "drizzle-orm";

interface GetAllSnapshotsResponse {
  success: boolean;
  snapshots?: HistorySnapshot[];
  error?: string;
  hasMore?: boolean;
  totalCount?: number;
}

// Type for snapshot account entries
type SnapshotAccount = InferSelectModel<typeof snapshotsAccounts>;

/**
 * Fetches snapshots with their account details with pagination
 * @param page Current page (starting from 1)
 * @param pageSize Number of snapshots per page
 * @returns Object containing paginated snapshots data or error message
 */
export async function getAllSnapshots(
  page = 1,
  pageSize = 10,
): Promise<GetAllSnapshotsResponse> {
  try {
    // Get current user session
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    const userId = session.user.id;

    // Count total snapshots for pagination info
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(snapshots)
      .where(eq(snapshots.userId, userId));

    const totalCount = totalCountResult[0]?.count || 0;

    // Calculate pagination values
    const offset = (page - 1) * pageSize;
    const hasMore = totalCount > offset + pageSize;

    // Find snapshots for the user, ordered by date (newest first) with pagination
    const userSnapshots = await db.query.snapshots.findMany({
      where: eq(snapshots.userId, userId),
      orderBy: [desc(snapshots.snapshotDate)],
      limit: pageSize,
      offset: offset,
    });

    // If no snapshots exist, return empty array
    if (userSnapshots.length === 0) {
      return {
        success: true,
        snapshots: [],
        hasMore: false,
        totalCount,
      };
    }

    // Get all snapshot IDs to fetch related data in batch
    const snapshotIds = userSnapshots.map((snapshot) => snapshot.id);
    const currencyRateIds = userSnapshots.map(
      (snapshot) => snapshot.currencyRateId,
    );

    // Batch fetch all currency rates for these snapshots
    const ratesData = await db.query.currencyRates.findMany({
      where: inArray(currencyRates.id, currencyRateIds),
    });

    // Create a map for quick lookup
    const ratesMap = new Map();
    ratesData.forEach((rate) => {
      ratesMap.set(rate.id, {
        usdRate: Number(rate.usdRate),
        goldRate: Number(rate.goldGrate),
      });
    });

    // Batch fetch all account entries for these snapshots
    const allAccountEntries = await db.query.snapshotsAccounts.findMany({
      where: inArray(snapshotsAccounts.snapshotId, snapshotIds),
    });

    // Group account entries by snapshot ID
    const accountEntriesBySnapshot = new Map();
    allAccountEntries.forEach((entry: SnapshotAccount) => {
      if (!accountEntriesBySnapshot.has(entry.snapshotId)) {
        accountEntriesBySnapshot.set(entry.snapshotId, []);
      }
      accountEntriesBySnapshot.get(entry.snapshotId).push(entry);
    });

    // Process each snapshot with the batched data
    const historySnapshots: HistorySnapshot[] = [];

    for (const snapshot of userSnapshots) {
      const snapshotAccounts = accountEntriesBySnapshot.get(snapshot.id) || [];

      if (snapshotAccounts.length === 0) {
        continue; // Skip this snapshot if no account data exists
      }

      const rates = ratesMap.get(snapshot.currencyRateId) || {
        usdRate: 0,
        goldRate: 0,
      };
      const usdRate = rates.usdRate;
      const goldRate = rates.goldRate;

      // Calculate metrics
      let liquidAssets = 0;
      let savings = 0;
      let liabilities = 0;

      // Process accounts
      const accountsData = snapshotAccounts.map((entry: SnapshotAccount) => {
        let balance = Number(entry.balance);

        // Convert balance to EGP for metric calculations
        let balanceInEGP = balance;
        if (entry.currency === "USD" && usdRate > 0) {
          balanceInEGP = balance * usdRate;
        } else if (entry.currency === "Gold" && goldRate > 0) {
          balanceInEGP = balance * goldRate;
        }

        // Update the metrics
        if (entry.isLiability) {
          liabilities += balanceInEGP;
        } else {
          if (entry.type === "Savings") {
            savings += balanceInEGP;
          } else {
            liquidAssets += balanceInEGP;
          }
        }

        // Return the account entry in the expected format
        return {
          id: entry.id,
          name: entry.name,
          type: entry.type,
          balance: entry.balance.toString(),
          currency: entry.currency,
          isLiability: entry.isLiability,
        };
      });

      // Calculate totals
      const totalAssets = liquidAssets + savings;
      const netTotal = totalAssets - liabilities;

      // Add this snapshot to the results
      historySnapshots.push({
        id: snapshot.id,
        snapshotDate: snapshot.snapshotDate,
        metrics: {
          liquidAssets,
          savings,
          liabilities,
          totalAssets,
          netTotal,
          usdRate,
          goldRate,
        },
        accounts: accountsData,
      });
    }

    return {
      success: true,
      snapshots: historySnapshots,
      hasMore,
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching snapshots:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetches all snapshots with their account details without pagination
 * @returns Object containing all snapshots data or error message
 */
export async function getAllSnapshotsWithoutPagination(): Promise<GetAllSnapshotsResponse> {
  try {
    // Get current user session
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    const userId = session.user.id;

    // Find all snapshots for the user, ordered by date (newest first)
    const userSnapshots = await db.query.snapshots.findMany({
      where: eq(snapshots.userId, userId),
      orderBy: [desc(snapshots.snapshotDate)],
    });

    // If no snapshots exist, return empty array
    if (userSnapshots.length === 0) {
      return {
        success: true,
        snapshots: [],
      };
    }

    // Get all snapshot IDs to fetch related data in batch
    const snapshotIds = userSnapshots.map((snapshot) => snapshot.id);
    const currencyRateIds = userSnapshots.map(
      (snapshot) => snapshot.currencyRateId,
    );

    // Batch fetch all currency rates for these snapshots
    const ratesData = await db.query.currencyRates.findMany({
      where: inArray(currencyRates.id, currencyRateIds),
    });

    // Create a map for quick lookup
    const ratesMap = new Map();
    ratesData.forEach((rate) => {
      ratesMap.set(rate.id, {
        usdRate: Number(rate.usdRate),
        goldRate: Number(rate.goldGrate),
      });
    });

    // Batch fetch all account entries for these snapshots
    const allAccountEntries = await db.query.snapshotsAccounts.findMany({
      where: inArray(snapshotsAccounts.snapshotId, snapshotIds),
    });

    // Group account entries by snapshot ID
    const accountEntriesBySnapshot = new Map();
    allAccountEntries.forEach((entry: SnapshotAccount) => {
      if (!accountEntriesBySnapshot.has(entry.snapshotId)) {
        accountEntriesBySnapshot.set(entry.snapshotId, []);
      }
      accountEntriesBySnapshot.get(entry.snapshotId).push(entry);
    });

    // Process each snapshot with the batched data
    const historySnapshots: HistorySnapshot[] = [];

    for (const snapshot of userSnapshots) {
      const snapshotAccounts = accountEntriesBySnapshot.get(snapshot.id) || [];

      if (snapshotAccounts.length === 0) {
        continue; // Skip this snapshot if no account data exists
      }

      const rates = ratesMap.get(snapshot.currencyRateId) || {
        usdRate: 0,
        goldRate: 0,
      };
      const usdRate = rates.usdRate;
      const goldRate = rates.goldRate;

      // Calculate metrics
      let liquidAssets = 0;
      let savings = 0;
      let liabilities = 0;

      // Process accounts
      const accountsData = snapshotAccounts.map((entry: SnapshotAccount) => {
        let balance = Number(entry.balance);

        // Convert balance to EGP for metric calculations
        let balanceInEGP = balance;
        if (entry.currency === "USD" && usdRate > 0) {
          balanceInEGP = balance * usdRate;
        } else if (entry.currency === "Gold" && goldRate > 0) {
          balanceInEGP = balance * goldRate;
        }

        // Update the metrics
        if (entry.isLiability) {
          liabilities += balanceInEGP;
        } else {
          if (entry.type === "Savings") {
            savings += balanceInEGP;
          } else {
            liquidAssets += balanceInEGP;
          }
        }

        // Return the account entry in the expected format
        return {
          id: entry.id,
          name: entry.name,
          type: entry.type,
          balance: entry.balance.toString(),
          currency: entry.currency,
          isLiability: entry.isLiability,
        };
      });

      // Calculate totals
      const totalAssets = liquidAssets + savings;
      const netTotal = totalAssets - liabilities;

      // Add this snapshot to the results
      historySnapshots.push({
        id: snapshot.id,
        snapshotDate: snapshot.snapshotDate,
        metrics: {
          liquidAssets,
          savings,
          liabilities,
          totalAssets,
          netTotal,
          usdRate,
          goldRate,
        },
        accounts: accountsData,
      });
    }

    return {
      success: true,
      snapshots: historySnapshots,
    };
  } catch (error) {
    console.error("Error fetching snapshots:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
