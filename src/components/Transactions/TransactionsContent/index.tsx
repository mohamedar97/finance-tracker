"use client";

import { Transaction } from "@/lib/types";
import { TransactionsTable } from "./TransactionsTable";
import { TransactionsFilter } from "./TransactionsFilter";

interface TransactionsContentProps {
  transactions: Transaction[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedCurrency: string;
  setSelectedCurrency: (value: string) => void;
  selectedAccount: string;
  setSelectedAccount: (value: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: (range: {
    from: Date | undefined;
    to: Date | undefined;
  }) => void;
  isFiltersOpen: boolean;
  setIsFiltersOpen: (value: boolean) => void;
  transactionTypes: string[];
  currencyTypes: string[];
  accountNames: string[];
  activeFiltersCount: number;
  filteredTransactions: Transaction[];
  totalTransactions: number;
  onEditTransaction: (id: string, data: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  displayCurrency: string;
}

export function TransactionsContent({
  transactions,
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  selectedCurrency,
  setSelectedCurrency,
  selectedAccount,
  setSelectedAccount,
  dateRange,
  setDateRange,
  isFiltersOpen,
  setIsFiltersOpen,
  transactionTypes,
  currencyTypes,
  accountNames,
  activeFiltersCount,
  filteredTransactions,
  totalTransactions,
  onEditTransaction,
  onDeleteTransaction,
  displayCurrency,
}: TransactionsContentProps) {
  return (
    <div className="space-y-4">
      <TransactionsFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        dateRange={dateRange}
        setDateRange={setDateRange}
        isFiltersOpen={isFiltersOpen}
        setIsFiltersOpen={setIsFiltersOpen}
        transactionTypes={transactionTypes}
        currencyTypes={currencyTypes}
        accountNames={accountNames}
        activeFiltersCount={activeFiltersCount}
      />
      <TransactionsTable
        transactions={filteredTransactions}
        onEditTransaction={onEditTransaction}
        onDeleteTransaction={onDeleteTransaction}
        displayCurrency={displayCurrency}
      />
    </div>
  );
}
