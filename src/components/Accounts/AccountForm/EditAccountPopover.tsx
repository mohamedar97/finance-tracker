"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PencilIcon } from "lucide-react";
import { AccountForm } from "./AccountForm";
import { Account } from "../types";
import type { AccountFormData } from "./types";
import { useState } from "react";

interface EditAccountPopoverProps {
  account: Account;
  onEditAccount: (id: string, updatedData: Partial<Account>) => void;
}

export function EditAccountPopover({
  account,
  onEditAccount,
}: EditAccountPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data: AccountFormData) => {
    console.log("Editing account:", data);
    // Here you would typically call an API to update the account
    onEditAccount(account.id, data);
    // Close the popover
    setOpen(false);
  };

  const handleCancel = () => {
    // Close the popover
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <PencilIcon className="h-4 w-4" />
          <span className="sr-only">Edit account</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Edit Account</h3>
          <AccountForm
            action="edit"
            defaultValues={account}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
