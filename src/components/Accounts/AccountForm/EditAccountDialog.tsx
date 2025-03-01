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
import { Account, AccountFormData } from "@/lib/types";
import { useState } from "react";
import { updateAccount } from "@/server/actions/accounts/updateAccount";
import { toast } from "sonner";

interface EditAccountDialogProps {
  account: Account;
  onEditAccount: (id: string, updatedData: Partial<Account>) => void;
}

export function EditAccountDialog({
  account,
  onEditAccount,
}: EditAccountDialogProps) {
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

      // Call the server action to update the account
      const result = await updateAccount({
        accountId: account.id,
        name: data.name,
        type: data.type,
        balance: data.balance,
        currency: data.currency,
        isLiability: data.isLiability,
      });

      if (result.success) {
        // Notify parent component about the updated account
        onEditAccount(account.id, data);

        // Show success toast
        toast.success("Account updated successfully");

        // Close the dialog
        setOpen(false);
      } else {
        // Show error toast
        toast.error(result.error || "Failed to update account");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while updating the account");
      console.error("Error updating account:", error);
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
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <PencilIcon className="h-4 w-4" />
          <span className="sr-only">Edit account</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95%] p-4 sm:max-w-[425px] sm:p-6">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <AccountForm
            action="edit"
            defaultValues={account}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
