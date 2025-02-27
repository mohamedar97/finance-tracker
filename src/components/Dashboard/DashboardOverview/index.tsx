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
import { Account, Transaction, SnapshotDataPoint } from "@/lib/types";

export function DashboardOverviewTab({
  accounts,
  transactions,
  snapshotData,
}: {
  accounts: Account[];
  transactions: Transaction[];
  snapshotData: SnapshotDataPoint[];
}) {
  return (
    <div className="space-y-4 p-2 sm:p-4">
      <DashboardMetrics accounts={accounts} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-12">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart accounts={accounts} snapshotData={snapshotData} />
          </CardContent>
        </Card>
        {/* <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={transactions} />
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
