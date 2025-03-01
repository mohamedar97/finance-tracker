export const dynamic = "force-dynamic";

import Transactions from "@/components/Transactions";
import { getTransactions } from "@/server/actions/transactions/getTransactions";

export default async function TransactionsPage() {
  // Fetch initial transactions
  const { transactions = [], success } = await getTransactions();

  return <Transactions initialTransactions={transactions} />;
}
