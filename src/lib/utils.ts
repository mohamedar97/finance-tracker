import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely formats a currency value, handling both standard and non-standard currencies
 * @param value The numeric value to format
 * @param currencyCode The currency code (ISO 4217) or custom currency name
 * @param isLiability Whether the value represents a liability (debt)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | string,
  currencyCode: string,
  isLiability = false,
): string {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  const absValue = Math.abs(numericValue);

  // List of standard currencies that work with Intl.NumberFormat
  const standardCurrencies = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CAD",
    "AUD",
    "CHF",
    "CNY",
    "HKD",
    "NZD",
    "SEK",
    "KRW",
    "SGD",
    "NOK",
    "MXN",
    "INR",
    "RUB",
    "ZAR",
    "TRY",
    "BRL",
    "TWD",
    "DKK",
    "PLN",
    "THB",
    "IDR",
    "HUF",
    "CZK",
    "ILS",
    "CLP",
    "PHP",
    "AED",
    "COP",
    "SAR",
    "MYR",
    "RON",
    "EGP",
  ];

  try {
    // Check if it's a standard currency
    if (standardCurrencies.includes(currencyCode)) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        signDisplay: isLiability ? "never" : "auto",
      }).format(absValue);
    } else {
      // For Gold
      return (
        "Grams " +
        new Intl.NumberFormat("en-US", {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(absValue)
      );
    }
  } catch (error) {
    // Fallback for any errors
    console.error(`Error formatting currency ${currencyCode}:`, error);
    return `${absValue.toFixed(2)} ${currencyCode}`;
  }
}
export const getStringFromBuffer = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

/**
 * Convert amount from source currency to target currency using the provided rates
 * @param amount The amount to convert
 * @param fromCurrency The source currency
 * @param toCurrency The target currency
 * @param usdRate The USD to EGP exchange rate
 * @param goldRate The Gold to EGP exchange rate (per gram)
 * @returns The converted amount
 */
export function convertCurrency(
  amount: number | string,
  fromCurrency: string,
  toCurrency: string,
  usdRate: number,
  goldRate: number,
): number {
  // Parse amount to number if it's a string
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  // First convert to EGP (base currency)
  let amountInEGP = 0;

  if (fromCurrency === "EGP") {
    amountInEGP = numericAmount;
  } else if (fromCurrency === "USD") {
    amountInEGP = numericAmount * usdRate;
  } else if (fromCurrency === "Gold") {
    amountInEGP = numericAmount * goldRate;
  }

  // Then convert to target currency
  if (toCurrency === "EGP") {
    return amountInEGP;
  } else if (toCurrency === "USD") {
    return amountInEGP / usdRate;
  } else if (toCurrency === "Gold") {
    return amountInEGP / goldRate;
  }

  // Fallback to original amount if currencies not recognized
  return numericAmount;
}
