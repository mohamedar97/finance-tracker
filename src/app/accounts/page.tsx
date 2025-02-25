export const dynamic = "force-dynamic";

import Accounts from "@/components/Accounts";
import { Account } from "@/lib/types";
import { getAccounts } from "@/server/actions/accounts/getAccounts";

export default async function AccountsPage() {
  const accountsRequest = await getAccounts();
  if (!accountsRequest.success) {
    throw new Error(accountsRequest.error);
  }
  const accounts = accountsRequest.accounts as Account[];
  return <Accounts initialAccounts={accounts} />;
}
