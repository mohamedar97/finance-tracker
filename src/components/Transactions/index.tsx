"use client";
import { useState, useEffect } from "react";
import { Transaction } from "@/lib/types";
import { useCurrency } from "@/lib/contexts/CurrencyContext";
import { convertCurrency } from "@/lib/utils";
import { TransactionsHeader } from "./TransactionsHeader";
import { TransactionsContent } from "./TransactionsContent";
import { TransactionsSummary } from "./TransactionsSummary";
import { toast } from "sonner";

export default function Transactions({
  initialTransactions,
}: {
  initialTransactions: Transaction[];
}) {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Transaction Types");
  const [selectedCurrency, setSelectedCurrency] = useState("All Currencies");
  const [selectedAccount, setSelectedAccount] = useState("All Accounts");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Get selected currency and rates from CurrencyContext
  const { usdRate, goldRate, selectedCurrency: globalCurrency } = useCurrency();

  // Extract all unique transaction types for filter
  const transactionTypes = [
    "All Transaction Types",
    ...new Set(transactions.map((transaction) => transaction.transactionType)),
  ];

  // Extract all unique currency types for filter
  const currencyTypes = [
    "All Currencies",
    ...new Set(transactions.map((transaction) => transaction.currency)),
  ];

  // Extract all unique account names for filter
  const accountNames = [
    "All Accounts",
    ...new Set(transactions.map((transaction) => transaction.accountId)),
  ];

  // Calculate active filters count
  const activeFiltersCount = [
    selectedType !== "All Transaction Types" ? 1 : 0,
    selectedCurrency !== "All Currencies" ? 1 : 0,
    selectedAccount !== "All Accounts" ? 1 : 0,
    dateRange.from || dateRange.to ? 1 : 0,
    searchTerm ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter((transaction) => {
    // Search term filter (check payee and description)
    const matchesSearch =
      !searchTerm ||
      (transaction.payee &&
        transaction.payee.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.description &&
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    // Transaction type filter
    const matchesType =
      selectedType === "All Transaction Types" ||
      transaction.transactionType === selectedType;

    // Currency filter
    const matchesCurrency =
      selectedCurrency === "All Currencies" ||
      transaction.currency === selectedCurrency;

    // Account filter
    const matchesAccount =
      selectedAccount === "All Accounts" ||
      transaction.accountId === selectedAccount;

    // Date range filter
    const transactionDate = new Date(transaction.transactionDate);
    const matchesDateRange =
      (!dateRange.from || transactionDate >= dateRange.from) &&
      (!dateRange.to || transactionDate <= dateRange.to);

    return (
      matchesSearch &&
      matchesType &&
      matchesCurrency &&
      matchesAccount &&
      matchesDateRange
    );
  });

  // Convert transaction amounts to the selected global currency
  const convertedTransactions = filteredTransactions.map((transaction) => {
    // Deep copy the transaction to avoid modifying the original
    const convertedTransaction = { ...transaction };

    // Only convert if the transaction currency is different from the selected currency
    if (transaction.currency !== globalCurrency) {
      // Convert the amount to the selected currency
      const convertedAmount = convertCurrency(
        transaction.amount,
        transaction.currency,
        globalCurrency,
        usdRate,
        goldRate,
      );

      // Add converted values to the transaction object
      convertedTransaction.convertedAmount = convertedAmount;
      convertedTransaction.displayCurrency = globalCurrency;
    } else {
      // If the transaction currency is the same as the selected one, use the original amount
      convertedTransaction.convertedAmount = Number(transaction.amount);
      convertedTransaction.displayCurrency = transaction.currency;
    }

    return convertedTransaction;
  });

  // Handle add transaction
  const onAddTransaction = (transactionData: Transaction) => {
    // Add the new transaction to the transactions state
    setTransactions([...transactions, transactionData]);
    toast.success("Transaction added successfully");
  };

  // Handle edit transaction
  const handleEditTransaction = (
    id: string,
    updatedData: Partial<Transaction>,
  ) => {
    // Update the transaction in the transactions state
    setTransactions((currentTransactions) =>
      currentTransactions.map((transaction) =>
        transaction.id === id
          ? {
              ...transaction,
              ...updatedData,
            }
          : transaction,
      ),
    );
    toast.success("Transaction updated successfully");
  };

  // Handle delete transaction
  const handleDeleteTransaction = (id: string) => {
    // Remove the transaction from the transactions state
    setTransactions((currentTransactions) =>
      currentTransactions.filter((transaction) => transaction.id !== id),
    );
    toast.success("Transaction deleted successfully");
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-2">
      <TransactionsHeader onAddTransaction={onAddTransaction} />

      <div className="grid gap-4">
        <TransactionsSummary
          transactions={filteredTransactions}
          activeFiltersCount={activeFiltersCount}
          totalFilteredTransactions={filteredTransactions.length}
          usdRate={usdRate}
          goldRate={goldRate}
        />
        <TransactionsContent
          transactions={transactions}
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
          filteredTransactions={convertedTransactions}
          totalTransactions={transactions.length}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          displayCurrency={globalCurrency}
        />
      </div>
    </div>
  );
}
