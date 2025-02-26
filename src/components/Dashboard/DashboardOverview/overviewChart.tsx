"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Account } from "@/lib/types";
import { useMemo } from "react";

// Sample data structure to be replaced with real data
const sampleData = [
  { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "May", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
];

export function OverviewChart({ accounts }: { accounts: Account[] }) {
  // In a real application, this would process transaction data by month
  // For now, we'll just use the sample data
  const chartData = useMemo(() => {
    // If no accounts, use sample data
    if (!accounts || accounts.length === 0) {
      return sampleData;
    }

    // In a real app, you would:
    // 1. Get transactions for each account
    // 2. Group them by month
    // 3. Calculate monthly totals

    // For now, just scale the sample data based on total account balance
    const totalBalance = accounts.reduce(
      (sum, account) => sum + parseFloat(account.balance),
      0,
    );

    // Scale factor to make chart data proportional to account balance
    const scaleFactor = totalBalance > 10000 ? totalBalance / 50000 : 1;

    return sampleData.map((item) => ({
      ...item,
      total: Math.floor(item.total * scaleFactor),
    }));
  }, [accounts]);

  // Default currency (use the first account's currency or USD as fallback)
  const currency =
    accounts && accounts.length > 0 ? (accounts[0]?.currency ?? "USD") : "USD";
  const currencySymbol =
    currency === "USD" ? "$" : currency === "EGP" ? "E£" : "$";

  return (
    <div className="h-[250px] sm:h-[300px] md:h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${currencySymbol}${value}`}
          />
          <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
