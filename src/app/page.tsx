import Dashboard from "@/components/Dashboard";
import { getAccounts } from "@/server/actions/accounts/getAccounts";

export default async function HomePage() {
  // Fetch accounts data on the server
  const { success, accounts, error } = await getAccounts();

  if (!success) {
    console.error("Failed to fetch accounts:", error);
  }

  return <Dashboard accounts={accounts || []} />;
}
