"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, FilterIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TransactionsFilterProps {
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
}

export function TransactionsFilter({
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
}: TransactionsFilterProps) {
  // Clear all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedType("All Transaction Types");
    setSelectedCurrency("All Currencies");
    setSelectedAccount("All Accounts");
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* Search Input */}
        <div className="relative flex-1">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <Button
          variant={isFiltersOpen ? "default" : "outline"}
          size="icon"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="relative h-9 w-9 p-0"
        >
          <FilterIcon className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* Reset Filters Button (only show when filters are active) */}
        {activeFiltersCount > 0 && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        )}
      </div>

      {/* Expandable Filters */}
      {isFiltersOpen && (
        <div className="grid gap-4 rounded-md border p-4 sm:grid-cols-2 md:grid-cols-4">
          {/* Transaction Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Transaction Type</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <Select
              value={selectedCurrency}
              onValueChange={setSelectedCurrency}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencyTypes.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Account</label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accountNames.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && !dateRange.to && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Select date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range) => {
                    setDateRange({
                      from: range?.from,
                      to: range?.to,
                    });
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
}
