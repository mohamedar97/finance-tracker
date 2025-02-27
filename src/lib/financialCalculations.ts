import { Account } from "./types";

export interface FinancialMetrics {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  totalSavings: number;
  liquidBalance: number;
  defaultCurrency: string;
}

/**
 * Calculate financial metrics from a list of accounts
 * @param accounts List of account objects
 * @returns Object containing calculated financial metrics
 */
export function calculateFinancialMetrics(
  accounts: Account[],
): FinancialMetrics {
  // Calculate total assets (non-liability accounts)
  const totalAssets = accounts
    .filter((account) => !account.isLiability)
    .reduce((total, account) => {
      return total + parseFloat(account.balance.toString());
    }, 0);

  // Calculate total liabilities (liability accounts)
  const totalLiabilities = accounts
    .filter((account) => account.isLiability)
    .reduce((total, account) => {
      return total + parseFloat(account.balance.toString());
    }, 0);

  // Calculate savings balance (accounts of type "Savings" that are assets)
  const totalSavings = accounts
    .filter((account) => account.type === "Savings" && !account.isLiability)
    .reduce((total, account) => {
      return total + parseFloat(account.balance.toString());
    }, 0);

  // Calculate liquid balance (current accounts)
  const liquidBalance = accounts
    .filter((account) => account.type === "Current")
    .reduce((total, account) => {
      return (
        total +
        parseFloat(account.balance.toString()) * (account.isLiability ? -1 : 1)
      );
    }, 0);

  // Default currency (use the first account's currency or USD as fallback)
  const defaultCurrency =
    accounts.length > 0 ? (accounts[0]?.currency ?? "USD") : "USD";

  const netWorth = totalAssets - totalLiabilities;

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    totalSavings,
    liquidBalance,
    defaultCurrency,
  };
}
