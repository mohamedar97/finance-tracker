import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AccountsFilter } from "./AccountsFilter";
import { AccountsTable } from "./AccountsTable";
import { AccountsCardList } from "./AccountsCardList";
import { Account, Currency } from "@/lib/types";

interface AccountsContentProps {
  accounts: Account[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedCurrency: string;
  setSelectedCurrency: (value: string) => void;
  liabilityFilter: string;
  setLiabilityFilter: (value: string) => void;
  isFiltersOpen: boolean;
  setIsFiltersOpen: (value: boolean) => void;
  accountTypes: string[];
  currencyTypes: string[];
  activeFiltersCount: number;
  filteredAccounts: Account[];
  totalAccounts: number;
  onEditAccount: (id: string, updatedData: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
  displayCurrency: Currency;
}

export function AccountsContent({
  accounts,
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  selectedCurrency,
  setSelectedCurrency,
  liabilityFilter,
  setLiabilityFilter,
  isFiltersOpen,
  setIsFiltersOpen,
  accountTypes,
  currencyTypes,
  activeFiltersCount,
  filteredAccounts,
  totalAccounts,
  onEditAccount,
  onDeleteAccount,
  displayCurrency,
}: AccountsContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Accounts</CardTitle>
        <CardDescription>
          Manage and view all your financial accounts in one place.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AccountsFilter
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
          totalFilteredAccounts={filteredAccounts.length}
          totalAccounts={totalAccounts}
        />

        {/* Desktop and Mobile Views */}
        <AccountsTable
          accounts={filteredAccounts}
          onEditAccount={onEditAccount}
          onDeleteAccount={onDeleteAccount}
          displayCurrency={displayCurrency}
        />
        <AccountsCardList
          accounts={filteredAccounts}
          onEditAccount={onEditAccount}
          onDeleteAccount={onDeleteAccount}
          displayCurrency={displayCurrency}
        />
      </CardContent>
    </Card>
  );
}
