export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  isLiability: boolean;
  lastUpdated: string;
  createdAt: string;
  userId: number;
}

// Filters and options
export const liabilityOptions = [
  "Assets & Liabilities",
  "Assets Only",
  "Liabilities Only",
];
