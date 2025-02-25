"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrashIcon } from "lucide-react";
import { Account } from "@/lib/types";
import { useState } from "react";
import { deleteAccount } from "@/server/actions/accounts/deleteAccount";
import { toast } from "sonner";

interface DeleteAccountDialogProps {
  account: Account;
  onDeleteAccount: (id: string) => void;
}

export function DeleteAccountDialog({
  account,
  onDeleteAccount,
}: DeleteAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing the dialog while submitting
    if (isSubmitting && !newOpen) return;
    setOpen(newOpen);
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);

      // Call the server action to delete the account
      const result = await deleteAccount(account.id);

      if (result.success) {
        // Notify parent component about the deleted account
        onDeleteAccount(account.id);

        // Show success toast
        toast.success("Account deleted successfully");

        // Close the dialog
        setOpen(false);
      } else {
        // Show error toast
        toast.error(result.error || "Failed to delete account");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while deleting the account");
      console.error("Error deleting account:", error);
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600"
        >
          <TrashIcon className="h-4 w-4" />
          <span className="sr-only">Delete account</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the account &quot;{account.name}
            &quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
