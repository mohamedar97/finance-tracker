import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OverviewChart } from "./overviewChart";
import { DashboardMetrics } from "./DashboardMetrics";
import { RecentTransactions } from "./recentTransactions";
import { Account } from "@/lib/types";

export function DashboardOverviewTab({ accounts }: { accounts: Account[] }) {
  return (
    <div className="space-y-4 p-2 sm:p-4">
      <DashboardMetrics accounts={accounts} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart accounts={accounts} />
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              You made 265 transactions this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
