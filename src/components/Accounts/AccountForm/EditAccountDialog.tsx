"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PencilIcon } from "lucide-react";
import { AccountForm } from "./AccountForm";
import { Account } from "../types";
import type { AccountFormData } from "./types";
import { useState } from "react";

interface EditAccountDialogProps {
  account: Account;
  onEditAccount: (id: string, updatedData: Partial<Account>) => void;
}

export function EditAccountDialog({
  account,
  onEditAccount,
}: EditAccountDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data: AccountFormData) => {
    console.log("Editing account:", data);
    // Here you would typically call an API to update the account
    onEditAccount(account.id, data);
    // Close the dialog
    setOpen(false);
  };

  const handleCancel = () => {
    // Close the dialog
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <PencilIcon className="h-4 w-4" />
          <span className="sr-only">Edit account</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <AccountForm
            action="edit"
            defaultValues={account}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
