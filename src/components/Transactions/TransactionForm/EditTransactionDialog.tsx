"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Transaction } from "@/lib/types";
import { TransactionForm } from "./TransactionForm";

interface EditTransactionDialogProps {
  transaction: Transaction;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
}

export function EditTransactionDialog({
  transaction,
  onClose,
  onSave,
}: EditTransactionDialogProps) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleSave = (updatedTransaction: Transaction) => {
    onSave(updatedTransaction);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[95%] p-4 sm:max-w-[425px] sm:p-6">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm
          transaction={transaction}
          onSubmit={handleSave}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
