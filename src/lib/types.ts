import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  accounts,
  currencyEnum,
  accountTypeEnum,
  transactions,
} from "../server/db/schema";

// Note: Account.id is a UUID string
export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

// Transaction types
export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;

export interface AccountFormData {
  name: string;
  type: AccountType;
  balance: string;
  currency: Currency;
  isLiability: boolean;
}

// Extract enum values from schema enums
export type Currency = (typeof currencyEnum.enumValues)[number];
export type AccountType = (typeof accountTypeEnum.enumValues)[number];
export const Currencies: Currency[] = ["EGP", "USD", "Gold"];
export const AccountTypes: AccountType[] = ["Savings", "Current"];
export interface DashboardMetricsData {
  netLiquid: {
    value: number;
    changePercentage: number;
  };
  netSavings: {
    value: number;
    changePercentage: number;
  };
  netTotal: {
    value: number;
    changePercentage: number;
  };
}
export interface HistoricalMetrics {
  liquidAssets: number;
  savings: number;
  liabilities: number;
  totalAssets: number;
  netTotal: number;
}

export interface SnapshotDataPoint {
  date: Date;
  metrics: HistoricalMetrics;
}
