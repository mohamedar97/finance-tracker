"use client";
import { useState, useEffect } from "react";
import { AccountsHeader } from "./AccountsHeader";
import { AccountsContent } from "./AccountsContent";
import { AccountsSummary } from "./AccountsSummary";
import { Account, NewAccount } from "@/lib/types";
import { useCurrency } from "@/lib/contexts/CurrencyContext";
import { convertCurrency } from "@/lib/utils";
import React from "react";

export default function Accounts({
  initialAccounts,
}: {
  initialAccounts: Account[];
}) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Account Types");
  const [selectedCurrency, setSelectedCurrency] = useState("All Currencies");
  const [liabilityFilter, setLiabilityFilter] = useState(
    "Assets & Liabilities",
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Get selected currency and rates from CurrencyContext
  const { usdRate, goldRate, selectedCurrency: globalCurrency } = useCurrency();

  // Log when currency values change
  useEffect(() => {
    console.log(
      "Currency changed:",
      globalCurrency,
      "USD Rate:",
      usdRate,
      "Gold Rate:",
      goldRate,
    );
  }, [globalCurrency, usdRate, goldRate]);

  // Extract all unique account types for filter
  const accountTypes = [
    "All Account Types",
    ...new Set(accounts.map((account) => account.type)),
  ];
  // Extract all unique currency types for filter
  const currencyTypes = [
    "All Currencies",
    ...new Set(accounts.map((account) => account.currency)),
  ];

  // Calculate active filters count
  const activeFiltersCount = [
    selectedType !== "All Account Types" ? 1 : 0,
    selectedCurrency !== "All Currencies" ? 1 : 0,
    liabilityFilter !== "Assets & Liabilities" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Filter accounts based on current filters
  const filteredAccounts = accounts.filter((account) => {
    // Search term filter
    const matchesSearch = account.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Account type filter
    const matchesType =
      selectedType === "All Account Types" || account.type === selectedType;

    // Currency filter
    const matchesCurrency =
      selectedCurrency === "All Currencies" ||
      account.currency === selectedCurrency;

    // Liability/Asset filter
    const matchesLiability =
      liabilityFilter === "Assets & Liabilities" ||
      (liabilityFilter === "Assets Only" && !account.isLiability) ||
      (liabilityFilter === "Liabilities Only" && account.isLiability);

    return matchesSearch && matchesType && matchesCurrency && matchesLiability;
  });

  // Convert account balances to the selected global currency
  const convertedAccounts = filteredAccounts.map((account) => {
    // Deep copy the account to avoid modifying the original
    const convertedAccount = { ...account };

    // Only convert if the account currency is different from the selected currency
    if (account.currency !== globalCurrency) {
      // Convert the balance to the selected currency
      convertedAccount.convertedBalance = convertCurrency(
        account.balance,
        account.currency,
        globalCurrency,
        usdRate,
        goldRate,
      );
      convertedAccount.displayCurrency = globalCurrency;
    } else {
      // If the account currency is the same as the selected one, use the original balance
      convertedAccount.convertedBalance = Number(account.balance);
      convertedAccount.displayCurrency = account.currency;
    }

    return convertedAccount;
  });

  // Handle add account
  const onAddAccount = (accountData: Account) => {
    // Add the new account to the accounts state
    setAccounts([...accounts, accountData]);
  };

  // Handle edit account
  const handleEditAccount = (id: string, updatedData: Partial<Account>) => {
    // Update the account in the accounts state
    setAccounts((currentAccounts) =>
      currentAccounts.map((account) =>
        account.id === id
          ? {
              ...account,
              ...updatedData,
              lastUpdated: new Date().toISOString(),
            }
          : account,
      ),
    );
  };

  // Handle delete account
  const handleDeleteAccount = (id: string) => {
    // Remove the account from the accounts state
    setAccounts((currentAccounts) =>
      currentAccounts.filter((account) => account.id !== id),
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-2">
      <AccountsHeader onAddAccount={onAddAccount} />

      <div className="grid gap-4">
        <AccountsSummary
          accounts={filteredAccounts}
          activeFiltersCount={activeFiltersCount}
          totalFilteredAccounts={filteredAccounts.length}
          usdRate={usdRate}
          goldRate={goldRate}
        />
        <AccountsContent
          accounts={accounts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          liabilityFilter={liabilityFilter}
          setLiabilityFilter={setLiabilityFilter}
          isFiltersOpen={isFiltersOpen}
          setIsFiltersOpen={setIsFiltersOpen}
          accountTypes={accountTypes}
          currencyTypes={currencyTypes}
          activeFiltersCount={activeFiltersCount}
          filteredAccounts={convertedAccounts}
          totalAccounts={accounts.length}
          onEditAccount={handleEditAccount}
          onDeleteAccount={handleDeleteAccount}
          displayCurrency={globalCurrency}
        />
      </div>
    </div>
  );
}
