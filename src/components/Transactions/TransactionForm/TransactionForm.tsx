"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTransaction } from "@/server/actions/transactions/createTransaction";
import { updateTransaction } from "@/server/actions/transactions/updateTransaction";
import { Transaction, NewTransaction, Currencies } from "@/lib/types";
import { getAccounts } from "@/server/actions/accounts/getAccounts";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (transaction: Transaction) => void;
  onCancel: () => void;
}

export function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState<Partial<NewTransaction>>({
    payee: transaction?.payee || "",
    amount: transaction?.amount || "",
    currency: transaction?.currency || "EGP",
    transactionType: transaction?.transactionType || "Expense",
    description: transaction?.description || "",
    category: transaction?.category || "",
    transactionDate:
      transaction?.transactionDate || new Date().toISOString().split("T")[0],
    accountId: transaction?.accountId || "",
  });
  const [date, setDate] = useState<Date | undefined>(
    transaction?.transactionDate
      ? new Date(transaction.transactionDate)
      : new Date(),
  );

  // Fetch accounts for the dropdown
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const result = await getAccounts();
        if (result.success && result.accounts.length > 0) {
          setAccounts(
            result.accounts.map((account) => ({
              id: account.id,
              name: account.name,
            })),
          );

          // Set default account if none selected and accounts are available
          if (!formData.accountId) {
            setFormData((prev) => ({
              ...prev,
              accountId: result.accounts[0]?.id || "",
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      }
    }

    fetchAccounts();
  }, [formData.accountId]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date change
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setFormData((prev) => ({
        ...prev,
        transactionDate: format(newDate, "yyyy-MM-dd"),
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountId || !formData.amount || !formData.transactionDate) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      let result;
      if (transaction) {
        // Update existing transaction
        result = await updateTransaction({
          id: transaction.id,
          ...formData,
        });
      } else {
        // Create new transaction
        result = await createTransaction(formData as NewTransaction);
      }

      if (result.success && result.transaction) {
        onSubmit(result.transaction);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to save transaction:", error);
      alert(
        error instanceof Error ? error.message : "Failed to save transaction",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      {/* Account Selection */}
      <div className="space-y-2">
        <Label htmlFor="accountId">Account *</Label>
        <Select
          value={formData.accountId || ""}
          onValueChange={(value) => handleSelectChange("accountId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transaction Type */}
      <div className="space-y-2">
        <Label htmlFor="transactionType">Transaction Type *</Label>
        <Select
          value={formData.transactionType || "Expense"}
          onValueChange={(value) =>
            handleSelectChange("transactionType", value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Transaction Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Income">Income</SelectItem>
            <SelectItem value="Expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="transactionDate">Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Payee */}
      <div className="space-y-2">
        <Label htmlFor="payee">Payee *</Label>
        <Input
          id="payee"
          name="payee"
          value={formData.payee || ""}
          onChange={handleChange}
          placeholder="Payee name"
          required
        />
      </div>

      {/* Amount and Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount || ""}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <Select
            value={formData.currency || "EGP"}
            onValueChange={(value) => handleSelectChange("currency", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {Currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          name="category"
          value={formData.category || ""}
          onChange={handleChange}
          placeholder="Category"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Description"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : transaction
              ? "Update Transaction"
              : "Create Transaction"}
        </Button>
      </div>
    </form>
  );
}
