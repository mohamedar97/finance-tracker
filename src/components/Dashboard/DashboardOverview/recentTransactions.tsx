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
                  transaction.amount < 0 ? "text-red-500" : "text-green-500"
                } tabular-nums`}
              >
                ${Math.abs(transaction.amount).toFixed(2)}
              </TableCell>
              <TableCell className="tabular-nums">
                {new Date(transaction.date).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
