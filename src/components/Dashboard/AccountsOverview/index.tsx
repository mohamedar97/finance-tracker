import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Account } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function AccountsOverview({ accounts }: { accounts: Account[] }) {
  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-center">
        <p className="text-muted-foreground">
          No accounts found. Add an account to get started.
        </p>
      </div>
    );
  }
  return (
    <ScrollArea className="h-[350px] lg:h-[calc(100vh-400px)]">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{account.name}</span>
                <span className="text-sm text-muted-foreground">
                  {account.type}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatCurrency(account.balance, account.currency)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Created At: {new Date(account.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
