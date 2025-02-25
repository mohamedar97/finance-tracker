import { Sidebar } from "@/components/Header/sidebar";
import { CurrencyToggle } from "@/components/Header/currencyToggle";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { fetchAndStoreFXRates } from "@/server/actions/FXRates/fetchAndStoreFXRates";

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

// Component that renders both sidebar and currency toggle with the fetched data
async function HeaderContent() {
  const { usdRate, goldRate, timestamp } = await fetchAndStoreFXRates();

  return (
    <>
      <div className="flex items-center">
        <Sidebar
          initialUsdRate={Number(usdRate)}
          initialGoldRate={Number(goldRate)}
          lastUpdated={timestamp}
        />
      </div>
      <div className="hidden items-center space-x-4 md:flex">
        <CurrencyToggle
          initialUsdRate={Number(usdRate)}
          initialGoldRate={Number(goldRate)}
          lastUpdated={timestamp}
        />
      </div>
    </>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 w-full items-center justify-between px-4 md:px-6">
        <Suspense fallback={<RatesLoading />}>
          <HeaderContent />
        </Suspense>
      </div>
    </header>
  );
}
