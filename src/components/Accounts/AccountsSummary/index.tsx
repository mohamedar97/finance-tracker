import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { calculateFinancialMetrics } from "@/lib/financialCalculations";
import { Account, Currency } from "@/lib/types";
import { convertCurrency, formatCurrency } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCurrency } from "@/lib/contexts/CurrencyContext";

interface AccountsSummaryProps {
  activeFiltersCount: number;
  totalFilteredAccounts: number;
  accounts: Account[];
  usdRate: number;
  goldRate: number;
}

export function AccountsSummary({
  activeFiltersCount,
  totalFilteredAccounts,
  accounts,
  usdRate,
  goldRate,
}: AccountsSummaryProps) {
  const {
    formattedTimestamp,
    selectedCurrency,
    setSelectedCurrency,
    refreshRates,
    isRefreshing,
  } = useCurrency();
  // Calculate metrics in base currency (EGP) with proper currency conversion
  const { totalAssets, totalLiabilities, netWorth } = calculateFinancialMetrics(
    accounts,
    usdRate,
    goldRate,
  );

  // Convert metrics to selected display currency
  const convertedTotalAssets = convertCurrency(
    totalAssets,
    "EGP", // Base currency used in calculations
    selectedCurrency,
    usdRate,
    goldRate,
  );

  const convertedTotalLiabilities = convertCurrency(
    totalLiabilities,
    "EGP", // Base currency used in calculations
    selectedCurrency,
    usdRate,
    goldRate,
  );

  const convertedNetWorth = convertCurrency(
    netWorth,
    "EGP", // Base currency used in calculations
    selectedCurrency,
    usdRate,
    goldRate,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Account Summary</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>All values shown in {selectedCurrency}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>
                  All values are converted to {selectedCurrency} based on
                  current exchange rates
                </p>
                <p className="mt-1 text-xs">
                  USD: {usdRate} EGP | Gold: {goldRate} EGP per gram
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          {activeFiltersCount > 0
            ? `Filtered summary of ${totalFilteredAccounts} accounts`
            : "Overview of all your account balances"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold">
              {formatCurrency(convertedTotalAssets, selectedCurrency)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Liabilities</p>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrency(
                convertedTotalLiabilities,
                selectedCurrency,
                true,
              )}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Net Worth</p>
            <p
              className={`text-2xl font-bold ${
                convertedNetWorth < 0 ? "text-red-500" : ""
              }`}
            >
              {formatCurrency(
                convertedNetWorth,
                selectedCurrency,
                convertedNetWorth < 0,
              )}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4 text-xs text-muted-foreground">
        <div className="flex w-full items-center justify-between">
          <span>Last Updated: {new Date().toLocaleDateString()}</span>
          {selectedCurrency !== "EGP" && (
            <span>
              Original (EGP): Assets {formatCurrency(totalAssets, "EGP")} |
              Liabilities {formatCurrency(totalLiabilities, "EGP", true)} | Net
              Worth {formatCurrency(netWorth, "EGP", netWorth < 0)}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
