import { ScrollArea } from "@/components/ui/scroll-area";
import { Account } from "../types";
import { EditAccountDialog } from "../AccountForm/EditAccountDialog";

interface AccountsCardListProps {
  accounts: Account[];
  onEditAccount: (id: string, updatedData: Partial<Account>) => void;
}

export function AccountsCardList({
  accounts,
  onEditAccount,
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
                  <div className="flex items-center gap-2">
                    <div
                      className={`font-semibold ${account.isLiability ? "text-red-500" : ""}`}
                    >
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: account.currency,
                        signDisplay: account.isLiability ? "never" : "auto",
                      }).format(Math.abs(account.balance))}
                      {account.isLiability ? " (debt)" : ""}
                    </div>
                    <EditAccountDialog
                      account={account}
                      onEditAccount={onEditAccount}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div>
                    Created: {new Date(account.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    Updated:{" "}
                    {new Date(account.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
