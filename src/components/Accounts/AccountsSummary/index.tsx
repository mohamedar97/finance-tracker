import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateFinancialMetrics } from "@/lib/financialCalculations";
import { Account } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface AccountsSummaryProps {
  activeFiltersCount: number;
  totalFilteredAccounts: number;
  accounts: Account[];
}

export function AccountsSummary({
  activeFiltersCount,
  totalFilteredAccounts,
  accounts,
}: AccountsSummaryProps) {
  const { totalAssets, totalLiabilities, netWorth, defaultCurrency } =
    calculateFinancialMetrics(accounts);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Summary</CardTitle>
        <CardDescription>
          {activeFiltersCount > 0
            ? `Filtered summary of ${totalFilteredAccounts} accounts`
            : "Overview of all your account balances"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold">
              {formatCurrency(totalAssets, defaultCurrency)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Liabilities</p>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrency(totalLiabilities, defaultCurrency, true)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Net Worth</p>
            <p
              className={`text-2xl font-bold ${
                netWorth < 0 ? "text-red-500" : ""
              }`}
            >
              {formatCurrency(netWorth, defaultCurrency, netWorth < 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
