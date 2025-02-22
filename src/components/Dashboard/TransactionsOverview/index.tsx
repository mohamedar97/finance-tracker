"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  account: string;
}

// Mock data - replace with real data later
const transactions: Transaction[] = [
  {
    id: "1",
    date: "2024-02-22",
    description: "Salary Deposit",
    amount: 5000.0,
    type: "income",
    category: "Salary",
    account: "Main Checking",
  },
  {
    id: "2",
    date: "2024-02-21",
    description: "Grocery Shopping",
    amount: -150.75,
    type: "expense",
    category: "Groceries",
    account: "Main Checking",
  },
  {
    id: "3",
    date: "2024-02-20",
    description: "Investment Dividend",
    amount: 250.5,
    type: "income",
    category: "Investment",
    account: "Investment Portfolio",
  },
  {
    id: "4",
    date: "2024-02-19",
    description: "Restaurant",
    amount: -85.2,
    type: "expense",
    category: "Dining",
    account: "Main Checking",
  },
  {
    id: "5",
    date: "2024-02-18",
    description: "Utilities Bill",
    amount: -200.0,
    type: "expense",
    category: "Utilities",
    account: "Main Checking",
  },
];

const categories = [
  "All",
  "Salary",
  "Groceries",
  "Investment",
  "Dining",
  "Utilities",
];
const accounts = [
  "All",
  "Main Checking",
  "Investment Portfolio",
  "Savings Account",
];

export function TransactionsOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedAccount, setSelectedAccount] = useState("All");

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || transaction.category === selectedCategory;
    const matchesAccount =
      selectedAccount === "All" || transaction.account === selectedAccount;
    return matchesSearch && matchesCategory && matchesAccount;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-1/3"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account} value={account}>
                {account}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.account}</TableCell>
                <TableCell
                  className={`text-right ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    signDisplay: "never",
                  }).format(Math.abs(transaction.amount))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
