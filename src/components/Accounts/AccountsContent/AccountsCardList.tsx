import { ScrollArea } from "@/components/ui/scroll-area";
import { Account, Currency } from "@/lib/types";
import { EditAccountDialog } from "../AccountForm/EditAccountDialog";
import { DeleteAccountDialog } from "../AccountForm/DeleteAccountDialog";
import { formatCurrency } from "@/lib/utils";

interface AccountsCardListProps {
  accounts: Account[];
  onEditAccount: (id: string, updatedData: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
  displayCurrency: Currency;
}

export function AccountsCardList({
  accounts,
  onEditAccount,
  onDeleteAccount,
  displayCurrency,
}: AccountsCardListProps) {
  return (
    <div className="block sm:hidden">
      <ScrollArea className="h-[350px]">
        <div className="space-y-4">
          {accounts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No accounts found.
            </div>
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                className="cursor-pointer space-y-2 rounded-lg border p-4 hover:bg-muted/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {account.type}
                      </span>
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          account.isLiability
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {account.isLiability ? "Liability" : "Asset"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className={`font-semibold ${account.isLiability ? "text-red-500" : ""}`}
                    >
                      {formatCurrency(
                        account.convertedBalance !== undefined
                          ? account.convertedBalance
                          : account.balance,
                        account.displayCurrency || account.currency,
                        account.isLiability,
                      )}
                    </div>
                    {account.currency !== displayCurrency && (
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(account.balance, account.currency)}
                      </div>
                    )}
                    <div className="mt-1 flex items-center space-x-1">
                      <EditAccountDialog
                        account={account}
                        onEditAccount={onEditAccount}
                      />
                      <DeleteAccountDialog
                        account={account}
                        onDeleteAccount={onDeleteAccount}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div>
                    Created: {new Date(account.createdAt).toLocaleDateString()}
                  </div>
                  <div>{account.currency}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
