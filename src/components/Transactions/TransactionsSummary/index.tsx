"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/lib/types";
import { useCurrency } from "@/lib/contexts/CurrencyContext";
import { convertCurrency, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon, InfoIcon } from "lucide-react";

interface TransactionsSummaryProps {
  transactions: Transaction[];
  activeFiltersCount: number;
  totalFilteredTransactions: number;
  usdRate: number;
  goldRate: number;
}

export function TransactionsSummary({
  transactions,
  activeFiltersCount,
  totalFilteredTransactions,
  usdRate,
  goldRate,
}: TransactionsSummaryProps) {
  const { selectedCurrency } = useCurrency();

  // Calculate total income
  const totalIncome = transactions
    .filter(
      (transaction) =>
        transaction.transactionType === "Income" &&
        transaction.category !== "Transfer",
    )
    .reduce((sum, transaction) => {
      const amount = Number(transaction.amount);
      // Convert to the selected currency if needed
      const convertedAmount =
        transaction.currency !== selectedCurrency
          ? convertCurrency(
              amount,
              transaction.currency,
              selectedCurrency,
              usdRate,
              goldRate,
            )
          : amount;
      return sum + convertedAmount;
    }, 0);

  // Calculate total expenses
  const totalExpenses = transactions
    .filter(
      (transaction) =>
        transaction.transactionType === "Expense" &&
        transaction.category !== "Transfer",
    )
    .reduce((sum, transaction) => {
      const amount = Number(transaction.amount);
      // Convert to the selected currency if needed
      const convertedAmount =
        transaction.currency !== selectedCurrency
          ? convertCurrency(
              amount,
              transaction.currency,
              selectedCurrency,
              usdRate,
              goldRate,
            )
          : amount;
      return sum + convertedAmount;
    }, 0);

  // Calculate net cash flow
  const netCashFlow = totalIncome - totalExpenses;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <Badge variant="secondary" className="ml-1 flex items-center gap-1">
            <InfoIcon size={12} />
            {activeFiltersCount > 0
              ? `${totalFilteredTransactions} filtered`
              : "All"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalIncome, selectedCurrency)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            {formatCurrency(totalExpenses, selectedCurrency, true)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
          <Badge
            variant={netCashFlow >= 0 ? "default" : "destructive"}
            className="ml-1 flex items-center gap-1"
          >
            {netCashFlow >= 0 ? (
              <ArrowUpIcon size={12} />
            ) : (
              <ArrowDownIcon size={12} />
            )}
            {netCashFlow >= 0 ? "Positive" : "Negative"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              netCashFlow >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {formatCurrency(netCashFlow, selectedCurrency, netCashFlow < 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
