"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import type { AccountFormData } from "./types";
import { AccountForm } from "./AccountForm";
import { useState } from "react";
import { toast } from "sonner";
import { createAccount } from "@/server/actions/accounts/createAccount";
import { Account } from "@/lib/types";
interface CreateAccountDialogProps {
  onAddAccount: (accountData: Account) => void;
}

export function CreateAccountDialog({
  onAddAccount,
}: CreateAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing the dialog while submitting
    if (isSubmitting && !newOpen) return;
    setOpen(newOpen);
  };

  const handleSubmit = async (data: AccountFormData) => {
    try {
      setIsSubmitting(true);

      // Call the server action to create the account
      const result = await createAccount({
        name: data.name,
        type: data.type,
        balance: data.balance,
        currency: data.currency,
        isLiability: data.isLiability,
      });

      if (result.success && result.account) {
        // Notify parent component about the new account
        onAddAccount(result.account);

        // Show success toast
        toast.success("Account created successfully");

        // Close the dialog
        setOpen(false);
      } else {
        // Show error toast
        toast.error(result.error || "Failed to create account");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while creating the account");
      console.error("Error creating account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Close the dialog
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-4 sm:max-w-[425px] md:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle>Create Account</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Add a new account to track your finances
          </p>
        </DialogHeader>
        <div className="py-1">
          <AccountForm
            action="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
