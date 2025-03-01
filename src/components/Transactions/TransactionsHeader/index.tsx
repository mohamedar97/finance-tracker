"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Transaction } from "@/lib/types";
import { CreateTransactionDialog } from "../TransactionForm/CreateTransactionDialog";

interface TransactionsHeaderProps {
  onAddTransaction: (transaction: Transaction) => void;
}

export function TransactionsHeader({
  onAddTransaction,
}: TransactionsHeaderProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="flex items-center justify-between space-y-2">
      <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
      <div className="flex gap-2">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {showAddDialog && (
        <CreateTransactionDialog
          onClose={() => setShowAddDialog(false)}
          onSave={onAddTransaction}
        />
      )}
    </div>
  );
}
