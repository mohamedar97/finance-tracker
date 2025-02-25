import { Sidebar } from "@/components/Header/sidebar";
import { CurrencyToggle } from "@/components/Header/currencyToggle";
import { Suspense } from "react";
import { cache } from "react";
import { Loader2 } from "lucide-react";

// Enhanced loading fallback component with animated loading indicator
function RatesLoading() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-1.5">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm font-medium">
          Loading rates
          <LoadingDots />
        </span>
      </div>
    </div>
  );
}

// Animated loading dots component
function LoadingDots() {
  return (
    <span className="ml-1 inline-flex">
      <span className="animate-dot-1">.</span>
      <span className="animate-dot-2">.</span>
      <span className="animate-dot-3">.</span>
    </span>
  );
}

// Cache the data fetching functions to avoid refetching
const fetchUSDToEGPCached = cache(async () => {
  const { fetchUSDToEGP } = await import(
    "@/server/actions/FXRates/fetchUSDToEGP"
  );
  return fetchUSDToEGP();
});

const fetchGoldToEGPCached = cache(async () => {
  const { fetchGoldToEGP } = await import(
    "@/server/actions/FXRates/fetchGoldToEGP"
  );
  return fetchGoldToEGP();
});

// Separate component that handles its own data fetching
async function CurrencyRates() {
  // Fetch both rates in parallel
  const [usdRate, goldRate] = await Promise.all([
    fetchUSDToEGPCached(),
    fetchGoldToEGPCached(),
  ]);

  return <CurrencyToggle usdRate={usdRate} goldRate={goldRate} />;
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 w-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <Sidebar />
        </div>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<RatesLoading />}>
            <CurrencyRates />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
