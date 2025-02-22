import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrencyToggle } from "@/components/Dashboard/currencyToggle";
import { AccountsOverview } from "@/components/accountsOverview";
import { TransactionsOverview } from "@/components/transactionsOverview";
import { DashboardOverviewTab } from "@/components/DashboardOverviewTab";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return <Dashboard />;
}
