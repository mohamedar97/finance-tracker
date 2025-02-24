import { CreateAccountDialog } from "../AccountForm/CreateAccountDialog";
import { AccountFormData } from "../AccountForm/types";

interface AccountsHeaderProps {
  onAddAccount: (accountData: AccountFormData) => void;
}

export function AccountsHeader({ onAddAccount }: AccountsHeaderProps) {
  return (
    <div className="flex items-center justify-between space-y-2">
      <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
      <CreateAccountDialog onAddAccount={onAddAccount} />
    </div>
  );
}
