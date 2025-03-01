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

interface CreateTransactionDialogProps {
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
}

export function CreateTransactionDialog({
  onClose,
  onSave,
}: CreateTransactionDialogProps) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleSave = (transaction: Transaction) => {
    onSave(transaction);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[95%] p-4 sm:max-w-[425px] sm:p-6">
        <DialogHeader>
          <DialogTitle>Create New Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm onSubmit={handleSave} onCancel={handleClose} />
      </DialogContent>
    </Dialog>
  );
}
