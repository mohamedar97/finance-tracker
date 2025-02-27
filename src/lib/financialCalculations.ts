import { Account } from "./types";
import { convertCurrency } from "./utils";

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
 * @param usdRate USD to EGP exchange rate
 * @param goldRate Gold to EGP exchange rate
 * @returns Object containing calculated financial metrics
 */
export function calculateFinancialMetrics(
  accounts: Account[],
  usdRate: number,
  goldRate: number,
): FinancialMetrics {
  // Use default rates if not provided (for backward compatibility)
  const usdRateValue = usdRate;
  const goldRateValue = goldRate;

  // Convert account balance to EGP (base currency) for accurate calculations
  const convertBalanceToEGP = (account: Account): number => {
    const balance = parseFloat(account.balance.toString());

    // If the account already has a converted balance in EGP, use that
    if (
      account.displayCurrency === "EGP" &&
      account.convertedBalance !== undefined
    ) {
      return account.convertedBalance;
    }

    // Otherwise, convert the original balance to EGP
    if (account.currency === "EGP") {
      return balance;
    } else if (account.currency === "USD") {
      return balance * usdRateValue;
    } else if (account.currency === "Gold") {
      return balance * goldRateValue;
    }

    // Fallback
    return balance;
  };

  // Calculate total assets (non-liability accounts) in EGP
  const totalAssets = accounts
    .filter((account) => !account.isLiability)
    .reduce((total, account) => {
      return total + convertBalanceToEGP(account);
    }, 0);

  // Calculate total liabilities (liability accounts) in EGP
  const totalLiabilities = accounts
    .filter((account) => account.isLiability)
    .reduce((total, account) => {
      return total + convertBalanceToEGP(account);
    }, 0);

  // Calculate savings balance (accounts of type "Savings" that are assets) in EGP
  const totalSavings = accounts
    .filter((account) => account.type === "Savings")
    .reduce((total, account) => {
      return account.isLiability
        ? total - convertBalanceToEGP(account)
        : total + convertBalanceToEGP(account);
    }, 0);

  // Calculate liquid balance (current accounts) in EGP
  const liquidBalance = accounts
    .filter((account) => account.type === "Current")
    .reduce((total, account) => {
      return (
        total + convertBalanceToEGP(account) * (account.isLiability ? -1 : 1)
      );
    }, 0);

  // Default currency is always EGP for the base calculations
  const defaultCurrency = "EGP";

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
