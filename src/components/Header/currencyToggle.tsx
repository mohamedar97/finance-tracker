"use client";

import * as React from "react";
import {
  Check,
  ChevronsUpDown,
  DollarSign,
  Banknote,
  RefreshCw,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { type Currency } from "@/lib/types";
import { currencyEnum } from "@/server/db/schema";
import Image from "next/image";
import { useCurrency } from "@/lib/contexts/CurrencyContext";

// Gold Bars image component
const GoldBarsImage = () => (
  <div className="relative h-4 w-4 overflow-hidden">
    <Image
      src="/gold_bars.png"
      alt="Gold Bars"
      fill
      className="object-contain"
    />
  </div>
);

// Define a type for currency options
type CurrencyOption = {
  label: string;
  value: Currency;
  icon: React.ReactNode;
};

// Get currency icon based on currency type
const getCurrencyIcon = (currency: Currency) => {
  switch (currency) {
    case "USD":
      return <DollarSign className="h-4 w-4 text-green-600" />;
    case "EGP":
      return <Banknote className="h-4 w-4 text-blue-600" />;
    case "Gold":
      return <GoldBarsImage />;
    default:
      return <DollarSign className="h-4 w-4" />;
  }
};

// Use the enum values directly from the schema
const currencies: CurrencyOption[] = currencyEnum.enumValues.map((value) => ({
  label: value,
  value: value as Currency,
  icon: getCurrencyIcon(value as Currency),
}));

interface CurrencyToggleProps {
  compact?: boolean;
}

export function CurrencyToggle({ compact = false }: CurrencyToggleProps) {
  const [open, setOpen] = useState(false);
  const {
    usdRate,
    goldRate,
    formattedTimestamp,
    selectedCurrency,
    setSelectedCurrency,
    refreshRates,
    isRefreshing,
  } = useCurrency();

  // Compact version for sidebar
  if (compact) {
    return (
      <div className="space-y-2 rounded-lg bg-muted/30 p-2">
        <h2 className="px-1 text-sm font-semibold tracking-tight">Currency</h2>

        {/* Currency selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between border-dashed transition-colors hover:border-primary"
            >
              <div className="flex items-center gap-2">
                {selectedCurrency &&
                  currencies.find(
                    (currency) => currency.value === selectedCurrency,
                  )?.icon}
                <span>
                  {selectedCurrency
                    ? currencies.find(
                        (currency) => currency.value === selectedCurrency,
                      )?.label
                    : "Currency"}
                </span>
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[120px] p-1">
            <div className="flex flex-col gap-1">
              {currencies.map((currency) => (
                <Button
                  key={currency.value}
                  variant="ghost"
                  className={cn(
                    "justify-start",
                    selectedCurrency === currency.value && "bg-muted",
                  )}
                  onClick={() => {
                    setSelectedCurrency(currency.value);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {currency.icon}
                    <span>{currency.label}</span>
                    {selectedCurrency === currency.value && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* FX Rates with icons */}
        <div className="mt-2 space-y-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center justify-between rounded-md bg-muted px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs font-medium">USD</span>
                  </div>
                  <span className="text-xs font-medium">{usdRate} EGP</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>The Bank Price of 1 USD in EGP</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center justify-between rounded-md bg-muted px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <GoldBarsImage />
                    <span className="text-xs font-medium">Gold</span>
                  </div>
                  <span className="text-xs font-medium">{goldRate} EGP</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>The Price of 1 Gram of 21 Carat Gold in EGP</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Update time and refresh button */}
        <div className="mt-2 flex items-center justify-between rounded-md bg-muted/50 px-2 py-1">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formattedTimestamp}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={refreshRates}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("h-3 w-3", isRefreshing && "animate-spin")}
            />
            <span className="sr-only">Refresh rates</span>
          </Button>
        </div>
      </div>
    );
  }

  // Original full version
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-muted/30 p-2 sm:flex-row">
      {/* Rate indicators with improved styling */}
      <div className="flex gap-3">
        {usdRate && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center gap-1 rounded-md bg-muted px-3 py-1 text-sm font-medium">
                  <DollarSign className="h-3.5 w-3.5 text-green-600" />
                  <span>{usdRate} EGP</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>The Bank Price of 1 USD in EGP</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {goldRate && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center gap-1 rounded-md bg-muted px-3 py-1 text-sm font-medium">
                  <span className="flex items-center">
                    <GoldBarsImage />
                  </span>
                  <span>{goldRate} EGP</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>The Price of 1 Gram of 21 Carat Gold in EGP</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Timestamp and refresh button */}
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex cursor-help items-center gap-1 rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formattedTimestamp}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last updated at {formattedTimestamp}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {true && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={refreshRates}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
            <span className="sr-only">Refresh rates</span>
          </Button>
        )}
      </div>

      {/* Currency selector with improved styling */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[120px] justify-between border-dashed transition-colors hover:border-primary"
          >
            <div className="flex items-center gap-2">
              {selectedCurrency &&
                currencies.find(
                  (currency) => currency.value === selectedCurrency,
                )?.icon}
              <span>
                {selectedCurrency
                  ? currencies.find(
                      (currency) => currency.value === selectedCurrency,
                    )?.label
                  : "Currency"}
              </span>
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[120px] p-1">
          <div className="flex flex-col gap-1">
            {currencies.map((currency) => (
              <Button
                key={currency.value}
                variant="ghost"
                className={cn(
                  "justify-start",
                  selectedCurrency === currency.value && "bg-muted",
                )}
                onClick={() => {
                  setSelectedCurrency(currency.value);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  {currency.icon}
                  <span>{currency.label}</span>
                  {selectedCurrency === currency.value && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
