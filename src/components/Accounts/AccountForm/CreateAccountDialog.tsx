"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { AccountFormData } from "./types";
import { AccountForm } from "./AccountForm";
import { useState } from "react";

interface CreateAccountDialogProps {
  onAddAccount: (accountData: AccountFormData) => void;
}

export function CreateAccountDialog({
  onAddAccount,
}: CreateAccountDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data: AccountFormData) => {
    console.log("Creating account:", data);
    // Pass the form data to the parent component
    onAddAccount(data);
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <AccountForm
            action="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
