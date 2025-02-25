"use client";

import React, { createContext, useContext, useState } from "react";
import { fetchAndStoreFXRates } from "@/server/actions/FXRates/fetchAndStoreFXRates";
import { type Currency } from "@/lib/types";

// Define the context type
type CurrencyContextType = {
  usdRate: number;
  goldRate: number;
  timestamp: Date;
  formattedTimestamp: string;
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  refreshRates: () => Promise<void>;
  isRefreshing: boolean;
};

// Context provider props
interface CurrencyProviderProps {
  children: React.ReactNode;
  initialUsdRate: number;
  initialGoldRate: number;
  initialTimestamp: Date;
}

// Create the context with a default value
const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

// Format date function
const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Provider component
export function CurrencyProvider({
  children,
  initialUsdRate,
  initialGoldRate,
  initialTimestamp,
}: CurrencyProviderProps) {
  const [usdRate, setUsdRate] = useState<number>(initialUsdRate);
  const [goldRate, setGoldRate] = useState<number>(initialGoldRate);
  const [timestamp, setTimestamp] = useState<Date>(initialTimestamp);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Format timestamp for display
  const formattedTimestamp = formatDateTime(timestamp);

  // Function to refresh rates
  const refreshRates = async () => {
    if (!isRefreshing) {
      try {
        setIsRefreshing(true);
        const { usdRate, goldRate, timestamp } = await fetchAndStoreFXRates({
          forceRefresh: true,
        });
        setUsdRate(Number(usdRate));
        setGoldRate(Number(goldRate));
        setTimestamp(timestamp);
      } catch (error) {
        console.error("Error refreshing rates:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Create the context value object
  const contextValue: CurrencyContextType = {
    usdRate,
    goldRate,
    timestamp,
    formattedTimestamp,
    selectedCurrency,
    setSelectedCurrency,
    refreshRates,
    isRefreshing,
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Custom hook to use the currency context
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
