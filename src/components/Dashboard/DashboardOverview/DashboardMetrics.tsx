import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateFinancialMetrics } from "@/lib/financialCalculations";
import { Account } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function DashboardMetrics({ accounts }: { accounts: Account[] }) {
  const {
    totalAssets,
    totalLiabilities,
    netWorth,
    totalSavings,
    liquidBalance,
    defaultCurrency,
  } = calculateFinancialMetrics(accounts);

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
            {formatCurrency(liquidBalance, defaultCurrency)}
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
            {formatCurrency(totalSavings, defaultCurrency, true)}
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
            {formatCurrency(netWorth, defaultCurrency, netWorth < 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
