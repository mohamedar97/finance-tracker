"use client";
import { useState } from "react";
import { AccountsHeader } from "./AccountsHeader";
import { AccountsContent } from "./AccountsContent";
import { AccountsSummary } from "./AccountsSummary";
import { accounts as initialAccounts } from "./data/accountsData";
import { Account, liabilityOptions } from "./types";
import { AccountFormData } from "./AccountForm/types";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Account Types");
  const [selectedCurrency, setSelectedCurrency] = useState("All Currencies");
  const [liabilityFilter, setLiabilityFilter] = useState(
    "Assets & Liabilities",
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

  // Calculate summary statistics
  const totalAssets = filteredAccounts
    .filter((account) => !account.isLiability)
    .reduce((sum, account) => sum + account.balance, 0);

  const totalLiabilities = filteredAccounts
    .filter((account) => account.isLiability)
    .reduce((sum, account) => sum + Math.abs(account.balance), 0);

  const netWorth = totalAssets - totalLiabilities;

  // Handle add account
  const handleAddAccount = (accountData: AccountFormData) => {
    const now = new Date().toISOString();

    // Create a new account with the data from the form
    const newAccount: Account = {
      id: (accounts.length + 1).toString(), // Simple ID generation
      name: accountData.name,
      type: accountData.type,
      balance: accountData.balance,
      currency: accountData.currency,
      isLiability: accountData.isLiability,
      lastUpdated: now,
      createdAt: now,
      userId: 1, // Default user ID
    };

    // Add the new account to the accounts state
    setAccounts([...accounts, newAccount]);
    console.log("Added new account:", newAccount);
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
    console.log(`Edited account ${id} with data:`, updatedData);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-2">
      <AccountsHeader onAddAccount={handleAddAccount} />

      <div className="grid gap-4">
        <AccountsSummary
          totalAssets={totalAssets}
          totalLiabilities={totalLiabilities}
          netWorth={netWorth}
          activeFiltersCount={activeFiltersCount}
          totalFilteredAccounts={filteredAccounts.length}
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
          liabilityOptions={liabilityOptions}
          activeFiltersCount={activeFiltersCount}
          filteredAccounts={filteredAccounts}
          totalAccounts={accounts.length}
          onEditAccount={handleEditAccount}
        />
      </div>
    </div>
  );
}
