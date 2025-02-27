export interface AccountFormData {
  name: string;
  type: "Savings" | "Checking";
  balance: string;
  currency: "USD" | "EGP" | "Gold";
  isLiability: boolean;
}
