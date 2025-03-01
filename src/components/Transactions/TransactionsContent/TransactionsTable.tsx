"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { EditTransactionDialog } from "../TransactionForm/EditTransactionDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { getAccountById } from "@/server/actions/accounts/getAccountById";
import { useEffect } from "react";
import { deleteTransaction } from "@/server/actions/transactions/deleteTransaction";

interface TransactionsTableProps {
  transactions: Transaction[];
  onEditTransaction: (id: string, data: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  displayCurrency: string;
}

export function TransactionsTable({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  displayCurrency,
}: TransactionsTableProps) {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [accountsMap, setAccountsMap] = useState<Record<string, string>>({});

  // Handle starting edit
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  // Handle transaction update
  const handleUpdate = (updatedTransaction: Transaction) => {
    onEditTransaction(updatedTransaction.id, updatedTransaction);
    setEditingTransaction(null);
  };

  // Handle starting delete
  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  // Handle confirming delete
  const handleConfirmDelete = async () => {
    if (deleteConfirm) {
      try {
        const result = await deleteTransaction(deleteConfirm);

        if (result.success) {
          // Call the parent component's onDeleteTransaction callback
          onDeleteTransaction(deleteConfirm);
        } else {
          // Show error
          alert(result.error || "Failed to delete transaction");
        }
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert(
          error instanceof Error
            ? error.message
            : "Failed to delete transaction",
        );
      } finally {
        setDeleteConfirm(null);
      }
    }
  };

  // Handle canceling delete
  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Display a message if no transactions
  if (transactions.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed bg-muted/30 p-8 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <h3 className="text-lg font-semibold">No transactions found</h3>
          <p className="text-sm text-muted-foreground">
            {transactions.length === 0
              ? "Add a new transaction to get started."
              : "Try adjusting your filters to find what you're looking for."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="h-[450px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-[140px]">Date</TableHead>
              <TableHead className="w-[180px]">Account</TableHead>
              <TableHead className="w-[180px]">Payee</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead className="w-[140px]">Amount</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="tabular-nums">
                  {new Date(transaction.transactionDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{transaction.accountName}</TableCell>
                <TableCell>{transaction.payee}</TableCell>
                <TableCell>
                  {transaction.category || (
                    <span className="text-muted-foreground">--</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      transaction.transactionType === "Income"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {transaction.transactionType}
                  </span>
                </TableCell>
                <TableCell
                  className={`tabular-nums ${
                    transaction.transactionType === "Expense"
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {formatCurrency(
                    transaction.convertedAmount || transaction.amount,
                    transaction.displayCurrency || transaction.currency,
                    transaction.transactionType === "Expense",
                  )}
                </TableCell>
                <TableCell className="flex items-center justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(transaction)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(transaction.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={handleUpdate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="w-[95%] p-4 sm:max-w-[425px] sm:p-6">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
