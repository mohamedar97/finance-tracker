"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Account, Currencies } from "@/lib/types";
import { transferBetweenAccounts } from "@/server/actions/accounts/transferBetweenAccounts";
import { useCurrency } from "@/lib/contexts/CurrencyContext";
import { convertCurrency, formatCurrency } from "@/lib/utils";

interface TransferFormProps {
  accounts: Account[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransferForm({
  accounts,
  onSuccess,
  onCancel,
}: TransferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("EGP");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Add state for transfer preview
  const [previewVisible, setPreviewVisible] = useState(false);
  const [sourcePreviewAmount, setSourcePreviewAmount] = useState<string>("");
  const [destPreviewAmount, setDestPreviewAmount] = useState<string>("");

  // Get currency rates from context
  const { usdRate, goldRate } = useCurrency();

  // Get selected accounts
  const selectedFromAccount = accounts.find(
    (account) => account.id === fromAccountId,
  );
  const selectedToAccount = accounts.find(
    (account) => account.id === toAccountId,
  );

  // Update preview when amount, currency, or accounts change
  useEffect(() => {
    if (
      !amount ||
      !selectedFromAccount ||
      !selectedToAccount ||
      isNaN(parseFloat(amount))
    ) {
      setPreviewVisible(false);
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      setPreviewVisible(false);
      return;
    }

    // Convert from transfer currency to source account currency
    const sourceAmount = convertCurrency(
      amountNum,
      currency,
      selectedFromAccount.currency,
      usdRate,
      goldRate,
    );

    // Convert from transfer currency to destination account currency
    const destAmount = convertCurrency(
      amountNum,
      currency,
      selectedToAccount.currency,
      usdRate,
      goldRate,
    );

    setSourcePreviewAmount(
      formatCurrency(sourceAmount, selectedFromAccount.currency, false),
    );
    setDestPreviewAmount(
      formatCurrency(destAmount, selectedToAccount.currency, false),
    );
    setPreviewVisible(true);
  }, [
    amount,
    currency,
    selectedFromAccount,
    selectedToAccount,
    usdRate,
    goldRate,
  ]);

  // Format account balance display with proper currency formatting
  const formatBalance = (account: Account | undefined) => {
    if (!account) return "";
    const balanceNumber = parseFloat(account.balance.toString());
    return formatCurrency(balanceNumber, account.currency, account.isLiability);
  };

  // Get equivalent amount in selected currency
  const getEquivalentAmount = (account: Account | undefined) => {
    if (!account || currency === account.currency) return null;

    const balanceNumber = parseFloat(account.balance.toString());
    const equivalentAmount = convertCurrency(
      balanceNumber,
      account.currency,
      currency,
      usdRate,
      goldRate,
    );

    return formatCurrency(equivalentAmount, currency, false);
  };

  // Set default values when accounts change
  useEffect(() => {
    if (accounts.length > 0 && !fromAccountId) {
      setFromAccountId(accounts[0]?.id || "");
    }
    if (accounts.length > 1 && !toAccountId) {
      setToAccountId(accounts[1]?.id || "");
    }
  }, [accounts, fromAccountId, toAccountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fromAccountId || !toAccountId || !amount) {
      setError("Please fill all required fields");
      return;
    }

    if (fromAccountId === toAccountId) {
      setError("Source and destination accounts cannot be the same");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Please enter a valid positive amount");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await transferBetweenAccounts({
        fromAccountId,
        toAccountId,
        amount: amountValue,
        currency,
        description,
        usdRate,
        goldRate,
      });

      if (result.success) {
        onSuccess();
      } else {
        // Cast the result to include error property
        const errorResult = result as { success: false; error: string };
        setError(errorResult.error || "Failed to transfer between accounts");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to transfer funds",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAccountOptions = (excludeId?: string) => {
    return accounts
      .filter((account) => account.id !== excludeId)
      .map((account) => (
        <SelectItem key={account.id} value={account.id}>
          {account.name} ({account.currency})
        </SelectItem>
      ));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-h-[80vh] space-y-4 overflow-y-auto pb-4 pt-4"
    >
      {/* From Account */}
      <div className="space-y-2">
        <Label htmlFor="fromAccountId">From Account *</Label>
        <Select
          value={fromAccountId}
          onValueChange={(value) => {
            setFromAccountId(value);
            if (value === toAccountId) {
              setToAccountId("");
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select source account" />
          </SelectTrigger>
          <SelectContent>{getAccountOptions(toAccountId)}</SelectContent>
        </Select>
        {selectedFromAccount && (
          <div className="mt-1 flex flex-col text-sm">
            <div className="flex justify-between">
              <span>Available balance:</span>
              <span className="font-medium">
                {formatBalance(selectedFromAccount)}
              </span>
            </div>
            {currency !== selectedFromAccount.currency && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Equivalent in {currency}:</span>
                <span>{getEquivalentAmount(selectedFromAccount)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* To Account */}
      <div className="space-y-2">
        <Label htmlFor="toAccountId">To Account *</Label>
        <Select
          value={toAccountId}
          onValueChange={(value) => {
            setToAccountId(value);
            if (value === fromAccountId) {
              setFromAccountId("");
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select destination account" />
          </SelectTrigger>
          <SelectContent>{getAccountOptions(fromAccountId)}</SelectContent>
        </Select>
        {selectedToAccount && (
          <div className="mt-1 flex flex-col text-sm">
            <div className="flex justify-between">
              <span>Current balance:</span>
              <span className="font-medium">
                {formatBalance(selectedToAccount)}
              </span>
            </div>
            {currency !== selectedToAccount.currency && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Equivalent in {currency}:</span>
                <span>{getEquivalentAmount(selectedToAccount)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Amount & Currency */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <Select
            value={currency}
            onValueChange={(value) => setCurrency(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {Currencies.map((curr) => (
                <SelectItem key={curr} value={curr}>
                  {curr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transfer Preview */}
      {previewVisible && (
        <div className="rounded-md bg-muted/50 p-3 text-sm">
          <h3 className="mb-1 font-semibold">Transfer Preview</h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Will withdraw:</span>
              <span className="font-medium">{sourcePreviewAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Will deposit:</span>
              <span className="font-medium">{destPreviewAmount}</span>
            </div>
            {selectedFromAccount?.currency !== selectedToAccount?.currency && (
              <>
                <div className="mt-2 border-t border-border pt-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Exchange Rates:
                  </p>
                  <div className="mt-1 grid grid-cols-1 gap-x-4 text-xs text-muted-foreground sm:grid-cols-2">
                    {usdRate && (
                      <div className="flex justify-between">
                        <span>1 USD =</span>
                        <span>{usdRate.toFixed(2)} EGP</span>
                      </div>
                    )}
                    {goldRate && (
                      <div className="flex justify-between">
                        <span>1g Gold =</span>
                        <span>{goldRate.toFixed(2)} EGP</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Note: Conversion applies between different currencies.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Transfer description"
        />
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Transfer Funds"}
        </Button>
      </div>
    </form>
  );
}
