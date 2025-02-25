import { CreateAccountDialog } from "../AccountForm/CreateAccountDialog";
import { Account } from "@/lib/types";
interface AccountsHeaderProps {
  onAddAccount: (accountData: Account) => void;
}

export function AccountsHeader({ onAddAccount }: AccountsHeaderProps) {
  return (
    <div className="flex items-center justify-between space-y-2">
      <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
      <CreateAccountDialog onAddAccount={onAddAccount} />
    </div>
  );
}
