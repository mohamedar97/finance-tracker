import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-center">
        <p className="text-muted-foreground">
          No transactions found. Add a transaction to get started.
        </p>
      </div>
    );
  }
  return (
    <div className="h-[350px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Payee</TableHead>
            <TableHead className="w-[30%]">Amount</TableHead>
            <TableHead className="w-[30%]">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.payee}</TableCell>
              <TableCell
                className={`${
                  transaction.transactionType === "Expense"
                    ? "text-red-500"
                    : "text-green-500"
                } tabular-nums`}
              >
                {formatCurrency(
                  Number(transaction.amount),
                  transaction.currency,
                  transaction.transactionType === "Expense",
                )}
              </TableCell>
              <TableCell className="tabular-nums">
                {new Date(transaction.transactionDate).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
