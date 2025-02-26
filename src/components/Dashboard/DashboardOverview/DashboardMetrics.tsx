import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Account } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function DashboardMetrics({ accounts }: { accounts: Account[] }) {
  // Calculate total balances
  const getTotalBalance = () => {
    return accounts.reduce((total, account) => {
      return total + parseFloat(account.balance);
    }, 0);
  };

  // Calculate savings balance (accounts of type "Savings")
  const getSavingsBalance = () => {
    return accounts
      .filter((account) => account.type === "Savings")
      .reduce((total, account) => {
        return total + parseFloat(account.balance);
      }, 0);
  };

  // Default currency (use the first account's currency or USD as fallback)
  const defaultCurrency =
    accounts.length > 0 ? (accounts[0]?.currency ?? "USD") : "USD";

  const totalBalance = getTotalBalance();
  const savingsBalance = getSavingsBalance();
  const liquidBalance = totalBalance - savingsBalance;

  return (
    <div className="flex flex-col justify-between md:flex-row md:gap-4">
      <Card className="mb-4 w-full md:mb-0 md:w-1/3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Liquid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(liquidBalance.toString(), defaultCurrency)}
          </div>
          <p className="text-xs text-muted-foreground">
            From {accounts.filter((a) => a.type !== "Savings").length}{" "}
            account(s)
          </p>
        </CardContent>
      </Card>
      <Card className="mb-4 w-full md:mb-0 md:w-1/3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(savingsBalance.toString(), defaultCurrency)}
          </div>
          <p className="text-xs text-muted-foreground">
            From {accounts.filter((a) => a.type === "Savings").length}{" "}
            account(s)
          </p>
        </CardContent>
      </Card>
      <Card className="w-full md:w-1/3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalBalance.toString(), defaultCurrency)}
          </div>
          <p className="text-xs text-muted-foreground">
            From {accounts.length} account(s)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
