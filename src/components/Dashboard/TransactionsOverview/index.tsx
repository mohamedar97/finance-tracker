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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

  const activeFiltersCount = [
    selectedCategory !== "All" ? 1 : 0,
    selectedAccount !== "All" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Mobile Filters */}
      <div className="flex items-center gap-2 sm:hidden">
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeFiltersCount}
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
              </div>
              <div className="space-y-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
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
                <Select
                  value={selectedAccount}
                  onValueChange={setSelectedAccount}
                >
                  <SelectTrigger>
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
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Desktop Filters */}
      <div className="hidden sm:flex sm:flex-col sm:space-y-4">
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
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
            <SelectTrigger className="w-full">
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
      </div>

      {/* Mobile View */}
      <div className="block sm:hidden">
        <ScrollArea className="h-[350px]">
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="space-y-2 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="font-medium">{transaction.description}</div>
                  <div
                    className={`font-semibold ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(
                      transaction.amount,
                      "USD",
                      transaction.type === "expense",
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString()}
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div>{transaction.category}</div>
                  <div>{transaction.account}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Desktop View */}
      <div className="hidden overflow-x-auto sm:block">
        <ScrollArea className="h-[calc(100vh-400px)] min-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Description</TableHead>
                <TableHead className="whitespace-nowrap">Category</TableHead>
                <TableHead className="whitespace-nowrap">Account</TableHead>
                <TableHead className="whitespace-nowrap text-right">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {transaction.description}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {transaction.category}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {transaction.account}
                  </TableCell>
                  <TableCell
                    className={`whitespace-nowrap text-right ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(
                      transaction.amount,
                      "USD",
                      transaction.type === "expense",
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
