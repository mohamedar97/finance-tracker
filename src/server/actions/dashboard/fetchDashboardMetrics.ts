"use server";

import { DashboardMetricsData } from "@/lib/types";
import { accounts, currencyRates } from "@/server/db/schema";
import { db } from "@/server/db";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/server/auth";
import { fetchSnapshot } from "@/server/actions/snapshots/fetchSnapshot";

export async function fetchDashboardMetrics(): Promise<DashboardMetricsData> {
  // Get current user session
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized access");
  }

  const userId = session.user.id;

  // Get all user accounts
  const userAccounts = await db.query.accounts.findMany({
    where: eq(accounts.userId, userId),
  });

  // Get latest currency rates
  const latestRates = await db.query.currencyRates.findFirst({
    orderBy: [desc(currencyRates.createdAt)],
  });

  if (!latestRates) {
    throw new Error("Currency rates not available");
  }

  // Calculate current metrics in EGP (base currency)
  let totalAssets = 0;
  let totalLiabilities = 0;
  let savingsAssets = 0;

  for (const account of userAccounts) {
    // Convert all currencies to EGP for consistent calculations
    let balanceInEGP = 0;

    if (account.currency === "USD") {
      balanceInEGP = Number(account.balance) * Number(latestRates.usdRate);
    } else if (account.currency === "EGP") {
      balanceInEGP = Number(account.balance);
    } else if (account.currency === "Gold") {
      // Convert gold directly to EGP
      balanceInEGP = Number(account.balance) * Number(latestRates.goldGrate);
    }

    if (account.isLiability) {
      totalLiabilities += balanceInEGP;
    } else {
      totalAssets += balanceInEGP;
      if (account.type === "Savings") {
        savingsAssets += balanceInEGP;
      }
    }
  }

  const liquidAssets = totalAssets - savingsAssets;
  const netWorth = totalAssets - totalLiabilities;

  // Default percentage changes if no previous data
  let liquidChange = 0;
  let savingsChange = 0;
  let netWorthChange = 0;

  // Get historical snapshot data from 30 days ago
  const historicalMetrics = await fetchSnapshot(30);

  // Calculate percentage changes if historical data exists
  if (historicalMetrics) {
    const {
      liquidAssets: previousLiquidAssets,
      savings: previousSavings,
      netTotal: previousNetTotal,
    } = historicalMetrics;

    // Formula: ((current - previous) / previous) * 100
    if (previousLiquidAssets > 0) {
      liquidChange = parseFloat(
        (
          ((liquidAssets - previousLiquidAssets) / previousLiquidAssets) *
          100
        ).toFixed(1),
      );
    }

    if (previousSavings > 0) {
      savingsChange = parseFloat(
        (((savingsAssets - previousSavings) / previousSavings) * 100).toFixed(
          1,
        ),
      );
    }

    if (previousNetTotal > 0) {
      netWorthChange = parseFloat(
        (((netWorth - previousNetTotal) / previousNetTotal) * 100).toFixed(1),
      );
    }
  }

  return {
    netLiquid: {
      value: parseFloat(liquidAssets.toFixed(2)),
      changePercentage: liquidChange,
    },
    netSavings: {
      value: parseFloat(savingsAssets.toFixed(2)),
      changePercentage: savingsChange,
    },
    netTotal: {
      value: parseFloat(netWorth.toFixed(2)),
      changePercentage: netWorthChange,
    },
  };
}
