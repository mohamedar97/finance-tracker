import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  accounts,
  currencyEnum,
  accountTypeEnum,
  transactions,
} from "../server/db/schema";

// Note: Account.id is a UUID string
export type Account = InferSelectModel<typeof accounts> & {
  // Optional fields for currency conversion display
  convertedBalance?: number;
  displayCurrency?: Currency;
};
export type NewAccount = InferInsertModel<typeof accounts>;

// Transaction types
export type Transaction = InferSelectModel<typeof transactions> & {
  // Optional fields for currency conversion display
  convertedAmount?: number;
  displayCurrency?: Currency;
  accountName?: string | null;
};
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
  usdRate: number;
  goldRate: number;
}

export interface SnapshotDataPoint {
  date: Date;
  metrics: HistoricalMetrics;
}

export interface HistorySnapshot {
  id: string;
  snapshotDate: string;
  metrics: HistoricalMetrics;
  accounts: {
    id: string;
    name: string;
    type: AccountType;
    balance: string;
    currency: Currency;
    isLiability: boolean;
  }[];
}

export interface CurrencyData {
  usdRate: number;
  goldRate: number;
  timestamp: Date;
  formattedTimestamp: string;
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  refreshRates: () => Promise<void>;
  isRefreshing: boolean;
}
