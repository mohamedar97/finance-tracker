import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const transactions = [
  {
    id: "1",
    payee: "Grocery Store",
    amount: -85.5,
    date: "2023-06-15",
  },
  {
    id: "2",
    payee: "Salary Deposit",
    amount: 3000.0,
    date: "2023-06-01",
  },
  {
    id: "3",
    payee: "Electric Bill",
    amount: -120.75,
    date: "2023-06-10",
  },
  {
    id: "4",
    payee: "Restaurant",
    amount: -45.0,
    date: "2023-06-18",
  },
  {
    id: "5",
    payee: "Gas Station",
    amount: -50.25,
    date: "2023-06-20",
  },
];

export function RecentTransactions() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Payee</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.payee}</TableCell>
            <TableCell
              className={
                transaction.amount < 0 ? "text-red-500" : "text-green-500"
              }
            >
              ${Math.abs(transaction.amount).toFixed(2)}
            </TableCell>
            <TableCell>{transaction.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
