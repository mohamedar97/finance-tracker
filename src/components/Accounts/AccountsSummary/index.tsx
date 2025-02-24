import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AccountsSummaryProps {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  activeFiltersCount: number;
  totalFilteredAccounts: number;
}

export function AccountsSummary({
  totalAssets,
  totalLiabilities,
  netWorth,
  activeFiltersCount,
  totalFilteredAccounts,
}: AccountsSummaryProps) {
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
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalAssets)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Liabilities</p>
            <p className="text-2xl font-bold text-red-500">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalLiabilities)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Net Worth</p>
            <p
              className={`text-2xl font-bold ${
                netWorth < 0 ? "text-red-500" : ""
              }`}
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(netWorth)}
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
