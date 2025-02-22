import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

// Mock data - replace with real data later
const accounts: Account[] = [
  {
    id: "1",
    name: "Main Checking",
    type: "Checking",
    balance: 12500.5,
    currency: "USD",
    lastUpdated: "2024-02-22",
  },
  {
    id: "2",
    name: "Savings Account",
    type: "Savings",
    balance: 45000.75,
    currency: "USD",
    lastUpdated: "2024-02-22",
  },
  {
    id: "3",
    name: "Investment Portfolio",
    type: "Investment",
    balance: 75000.25,
    currency: "USD",
    lastUpdated: "2024-02-22",
  },
  {
    id: "4",
    name: "Emergency Fund",
    type: "Savings",
    balance: 15000.0,
    currency: "USD",
    lastUpdated: "2024-02-22",
  },
];

export function AccountsOverview() {
  return (
    <ScrollArea className="h-[600px]">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{account.name}</span>
                <span className="text-muted-foreground text-sm">
                  {account.type}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: account.currency,
                  }).format(account.balance)}
                </div>
                <p className="text-muted-foreground text-xs">
                  Last updated:{" "}
                  {new Date(account.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
