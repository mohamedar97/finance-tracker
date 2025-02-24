"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import type { AccountFormData } from "./types";
import { AccountForm } from "./AccountForm";
import { useState } from "react";

interface CreateAccountPopoverProps {
  onAddAccount: (accountData: AccountFormData) => void;
}

export function CreateAccountPopover({
  onAddAccount,
}: CreateAccountPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data: AccountFormData) => {
    console.log("Creating account:", data);
    // Pass the form data to the parent component
    onAddAccount(data);
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
        <Button>
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Create Account</h3>
          <AccountForm
            action="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
