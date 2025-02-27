import Dashboard from "@/components/Dashboard";
import { getAccounts } from "@/server/actions/accounts/getAccounts";
import { getTransactions } from "@/server/actions/transactions/getTransactions";
import { fetchSnapshotsInRange } from "@/server/actions/snapshots/fetchSnapshotsInRange";

export default async function HomePage() {
  // Fetch accounts data on the server
  const {
    success: accountsSuccess,
    accounts,
    error: accountsError,
  } = await getAccounts();

  // Fetch transactions data on the server
  const {
    success: transactionsSuccess,
    transactions,
    error: transactionsError,
  } = await getTransactions();

  // Fetch snapshots data for the chart (last 6 months by default)
  const snapshotData = await fetchSnapshotsInRange();

  if (!accountsSuccess) {
    console.error("Failed to fetch accounts:", accountsError);
  }

  if (!transactionsSuccess) {
    console.error("Failed to fetch transactions:", transactionsError);
  }

  return (
    <Dashboard
      accounts={accounts || []}
      transactions={transactions || []}
      snapshotData={snapshotData}
    />
  );
}
