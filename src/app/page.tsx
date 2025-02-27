import Dashboard from "@/components/Dashboard";
import { getAccounts } from "@/server/actions/accounts/getAccounts";
import { getTransactions } from "@/server/actions/transactions/getTransactions";

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

  if (!accountsSuccess) {
    console.error("Failed to fetch accounts:", accountsError);
  }

  if (!transactionsSuccess) {
    console.error("Failed to fetch transactions:", transactionsError);
  }

  return (
    <Dashboard accounts={accounts || []} transactions={transactions || []} />
  );
}
