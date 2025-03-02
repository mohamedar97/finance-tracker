"use client";
import { useState, useEffect } from "react";
import { AccountsHeader } from "./AccountsHeader";
import { AccountsContent } from "./AccountsContent";
import { AccountsSummary } from "./AccountsSummary";
import { Account, NewAccount } from "@/lib/types";
import { useCurrency } from "@/lib/contexts/CurrencyContext";
import { convertCurrency } from "@/lib/utils";
import React from "react";
import { Button } from "../ui/button";
import { ArrowLeftRight, Plus, Save, MoreHorizontal } from "lucide-react";
import { TransferDialog } from "./TransferDialog";
import { CreateAccountDialog } from "./AccountForm/CreateAccountDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { createSnapshot } from "@/server/actions/snapshots/createSnapshot";
import { toast } from "sonner";
import { getAccounts } from "@/server/actions/accounts/getAccounts";

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
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showCreateAccountDialog, setShowCreateAccountDialog] = useState(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  // Get selected currency and rates from CurrencyContext
  const { usdRate, goldRate, selectedCurrency: globalCurrency } = useCurrency();

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

  // Add function to refresh accounts data
  const refreshAccountsData = async () => {
    try {
      const response = await getAccounts();
      if (response.success && response.accounts) {
        setAccounts(response.accounts);
      } else if (response.error) {
        toast.error(response.error);
      }
    } catch (error) {
      console.error("Error refreshing accounts:", error);
      toast.error("Failed to refresh account data");
    }
  };

  // Handle add account
  const onAddAccount = async (accountData: Account) => {
    // Add the new account to the accounts state
    setAccounts([...accounts, accountData]);
    setShowCreateAccountDialog(false);
    // Refresh accounts data to ensure UI is up to date
    await refreshAccountsData();
  };

  // Handle edit account
  const handleEditAccount = async (
    id: string,
    updatedData: Partial<Account>,
  ) => {
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
    // Refresh accounts data to ensure UI is up to date
    await refreshAccountsData();
  };

  // Handle delete account
  const handleDeleteAccount = async (id: string) => {
    // Remove the account from the accounts state
    setAccounts((currentAccounts) =>
      currentAccounts.filter((account) => account.id !== id),
    );
    // Refresh accounts data to ensure UI is up to date
    await refreshAccountsData();
  };

  // Handle create snapshot
  const handleCreateSnapshot = async () => {
    try {
      setIsCreatingSnapshot(true);
      const result = await createSnapshot();

      if (result.success) {
        toast.success("Financial snapshot has been saved successfully.");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create snapshot",
      );
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  // Add effect to refresh accounts data on mount
  useEffect(() => {
    refreshAccountsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 pt-2">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>

        {/* Mobile buttons - visible only on small screens */}
        <div className="flex w-full gap-2 sm:hidden">
          <Button
            onClick={handleCreateSnapshot}
            disabled={isCreatingSnapshot}
            variant="outline"
            className="flex-1 justify-center"
            size="sm"
          >
            <Save className="mr-2 size-4" />
            <span>{isCreatingSnapshot ? "..." : "Snapshot"}</span>
          </Button>

          <Button
            className="flex-1 justify-center"
            size="sm"
            onClick={() => setShowCreateAccountDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Add</span>
          </Button>

          <Button
            variant="outline"
            className="flex-1 justify-center gap-2"
            size="sm"
            onClick={() => setShowTransferDialog(true)}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>Transfer</span>
          </Button>
        </div>

        {/* Desktop menu - visible only on larger screens */}
        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="default">
                Actions
                <MoreHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={handleCreateSnapshot}
                disabled={isCreatingSnapshot}
                className="cursor-pointer"
              >
                <Save className="mr-2 h-4 w-4" />
                <span>
                  {isCreatingSnapshot ? "Creating..." : "Save Snapshot"}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowCreateAccountDialog(true)}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Add Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowTransferDialog(true)}
                className="cursor-pointer"
              >
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                <span>Transfer</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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

      {/* Dialogs */}
      {showTransferDialog && (
        <TransferDialog
          accounts={accounts}
          onClose={() => setShowTransferDialog(false)}
          onSuccess={async () => {
            // Refresh account data after successful transfer
            await refreshAccountsData();
            setShowTransferDialog(false);
          }}
        />
      )}

      {showCreateAccountDialog && (
        <CreateAccountDialog
          onAddAccount={onAddAccount}
          onCancel={() => setShowCreateAccountDialog(false)}
          openState={showCreateAccountDialog}
        />
      )}
    </div>
  );
}
