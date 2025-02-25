"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Account } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { AccountFormData } from "./types";
import { Loader2 } from "lucide-react";

const accountTypes = ["Checking", "Savings"];

const currencies = ["USD", "EGP", "Gold"];

interface AccountFormProps {
  action: "create" | "edit";
  defaultValues?: Account;
  onSubmit: (data: AccountFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function AccountForm({
  action,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: AccountFormProps) {
  const [formData, setFormData] = useState<AccountFormData>({
    name: defaultValues?.name || "",
    type: defaultValues?.type || "Checking",
    balance: defaultValues?.balance || "",
    currency: defaultValues?.currency || "EGP",
    isLiability: defaultValues?.isLiability || false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isLiability: checked,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Account Name
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g. Primary Checking"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="type" className="text-sm font-medium">
          Account Type
        </label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleSelectChange("type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            {accountTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label htmlFor="currency" className="text-sm font-medium">
          Currency
        </label>
        <Select
          value={formData.currency}
          onValueChange={(value) => handleSelectChange("currency", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label htmlFor="balance" className="text-sm font-medium">
          Balance
        </label>
        <Input
          id="balance"
          name="balance"
          type="string"
          placeholder="e.g. 1000.00"
          value={formData.balance}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="flex items-center space-x-2 pt-1">
        <Checkbox
          id="isLiability"
          checked={formData.isLiability}
          onCheckedChange={handleCheckboxChange}
        />
        <label
          htmlFor="isLiability"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          This is a liability (debt)
        </label>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="flex-1 sm:flex-none"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 sm:flex-none"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {action === "create" ? "Creating..." : "Saving..."}
            </>
          ) : action === "create" ? (
            "Create Account"
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
