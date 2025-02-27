import React from "react";
import { CurrencyToggle } from "../Header/currencyToggle";
import { TransactionsOverview } from "./TransactionsOverview";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AccountsOverview } from "./AccountsOverview";
import { DashboardOverviewTab } from "./DashboardOverview";
import { Account, Transaction, SnapshotDataPoint } from "@/lib/types";

const Dashboard = ({
  accounts,
  transactions,
  snapshotData,
}: {
  accounts: Account[];
  transactions: Transaction[];
  snapshotData: SnapshotDataPoint[];
}) => {
  return (
    <div className="flex-1 space-y-4 p-4 pt-2">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <DashboardOverviewTab
            accounts={accounts}
            transactions={transactions}
            snapshotData={snapshotData}
          />
        </TabsContent>
        <TabsContent value="accounts" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>All Accounts</CardTitle>
                <CardDescription>
                  Manage and view all your financial accounts in one place.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccountsOverview accounts={accounts} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="transactions" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription className="hidden lg:block">
                  View and manage your transaction history across all accounts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionsOverview transactions={transactions} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
