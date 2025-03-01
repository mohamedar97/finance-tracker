"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Account } from "@/lib/types";
import { TransferForm } from "./TransferForm";

interface TransferDialogProps {
  accounts: Account[];
  onClose: () => void;
  onSuccess: () => void;
}

export function TransferDialog({
  accounts,
  onClose,
  onSuccess,
}: TransferDialogProps) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleSuccess = () => {
    onSuccess();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[95%] p-4 sm:max-w-[500px] sm:p-6">
        <DialogHeader>
          <DialogTitle>Transfer Between Accounts</DialogTitle>
        </DialogHeader>
        <TransferForm
          accounts={accounts}
          onCancel={handleClose}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
