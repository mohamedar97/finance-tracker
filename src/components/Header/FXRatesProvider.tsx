import { fetchAndStoreFXRates } from "@/server/actions/FXRates/fetchAndStoreFXRates";
import { CurrencyProvider } from "@/lib/contexts/CurrencyContext";

// This is a server component that fetches rates and initializes the client-side context
export async function FXRatesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch rates on the server
  const { usdRate, goldRate, timestamp } = await fetchAndStoreFXRates();

  return (
    <CurrencyProvider
      initialUsdRate={Number(usdRate)}
      initialGoldRate={Number(goldRate)}
      initialTimestamp={timestamp}
    >
      {children}
    </CurrencyProvider>
  );
}
