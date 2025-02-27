"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateFinancialMetrics } from "@/lib/financialCalculations";
import { Account } from "@/lib/types";
import { convertCurrency, formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/lib/contexts/CurrencyContext";

export function DashboardMetrics({ accounts }: { accounts: Account[] }) {
  const { usdRate, goldRate, selectedCurrency } = useCurrency();
  const {
    totalAssets,
    totalLiabilities,
    netWorth,
    totalSavings,
    liquidBalance,
    defaultCurrency,
  } = calculateFinancialMetrics(accounts, usdRate, goldRate);
  const convertedLiquidBalance = convertCurrency(
    liquidBalance,
    "EGP", // Base currency used in calculations
    selectedCurrency,
    usdRate,
    goldRate,
  );
  const convertedTotalAssets = convertCurrency(
    totalAssets,
    "EGP", // Base currency used in calculations
    selectedCurrency,
    usdRate,
    goldRate,
  );
  const convertedTotalLiabilities = convertCurrency(
    totalLiabilities,
    "EGP", // Base currency used in calculations
    selectedCurrency,
    usdRate,
    goldRate,
  );
  const convertedTotalSavings = convertCurrency(
    totalSavings,
    "EGP", // Base currency used in calculations
    selectedCurrency,
    usdRate,
    goldRate,
  );
  const convertedNetWorth = convertCurrency(
    netWorth,
    "EGP", // Base currency used in calculations
    selectedCurrency,
    usdRate,
    goldRate,
  );
  return (
    <div className="flex flex-col justify-between md:flex-row md:gap-4">
      <Card className="mb-4 w-full md:mb-0 md:w-1/3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Liquid</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${liquidBalance < 0 ? "text-red-500" : ""}`}
          >
            {formatCurrency(convertedLiquidBalance, selectedCurrency)}
          </div>
          <p className="text-xs text-muted-foreground">
            From {accounts.filter((a) => a.type === "Current").length}{" "}
            account(s)
          </p>
        </CardContent>
      </Card>
      <Card className="mb-4 w-full md:mb-0 md:w-1/3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${totalSavings < 0 ? "text-red-500" : ""}`}
          >
            {formatCurrency(convertedTotalSavings, selectedCurrency)}
          </div>
          <p className="text-xs text-muted-foreground">
            From {accounts.filter((a) => a.type === "Savings").length}{" "}
            account(s)
          </p>
        </CardContent>
      </Card>
      <Card className="w-full md:w-1/3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${netWorth < 0 ? "text-red-500" : ""}`}
          >
            {formatCurrency(convertedNetWorth, selectedCurrency, netWorth < 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
