"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

const currencies = [
  { label: "USD", value: "usd" },
  { label: "EGP", value: "egp" },
];

export function CurrencyToggle() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("usd");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[100px] justify-between"
        >
          {value
            ? currencies.find((currency) => currency.value === value)?.label
            : "Select currency..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[100px] p-1">
        <div className="flex flex-col gap-1">
          {currencies.map((currency) => (
            <Button
              key={currency.value}
              variant="ghost"
              className="justify-start"
              onClick={() => {
                setValue(currency.value);
                setOpen(false);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",

                  value === currency.value ? "opacity-100" : "opacity-0",
                )}
              />
              {currency.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
