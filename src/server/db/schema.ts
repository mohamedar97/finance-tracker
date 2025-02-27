import {
  serial,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  date,
  boolean,
  pgTableCreator,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `finance-tracker_${name}`);

// Define enums
export const currencyEnum = pgEnum("currency_type", ["EGP", "USD", "Gold"]);
export const accountTypeEnum = pgEnum("account_type", ["Savings", "Current"]);
export const transactionTypeEnum = pgEnum("transaction_type", [
  "Income",
  "Expense",
]);

// Users Table
export const users = createTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 100 }).notNull().unique(),
  hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),
  salt: varchar("salt", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Accounts Table
export const accounts = createTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  currency: currencyEnum("currency").notNull(), // Using enum instead of varchar
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull(), // e.g., 1000.00
  type: accountTypeEnum("type").notNull(), // Using enum instead of varchar
  isLiability: boolean("is_liability").notNull().default(false), // true for debts/liabilities, false for assets
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions Table
export const transactions = createTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  accountId: uuid("account_id")
    .references(() => accounts.id)
    .notNull(),
  currencyRateId: integer("currency_rate_id").references(
    () => currencyRates.id,
  ),
  payee: varchar("payee", { length: 50 }),
  currency: currencyEnum("currency").notNull(),
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  transactionDate: date("transaction_date").notNull(),
});

// Currency Rates Table
export const currencyRates = createTable("currency_rates", {
  id: serial("id").primaryKey(),
  usdRate: decimal("usd_rate", { precision: 15, scale: 6 }).notNull(), // EGP per 1 USD
  goldGrate: decimal("gold_g_rate", { precision: 15, scale: 6 }).notNull(), // EGP per 1g of 21 carat gold
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Snapshots Table
export const snapshots = createTable("snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  snapshotDate: date("snapshot_date").notNull(),
  currencyRateId: integer("currency_rate_id").references(
    () => currencyRates.id,
  ),
  liquidAssets: decimal("liquid_assets", { precision: 15, scale: 2 }).notNull(),
  savings: decimal("savings", { precision: 15, scale: 2 }).notNull(),
  liabilities: decimal("liabilities", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// BankStatements Table (Optional)
export const bankStatements = createTable("bank_statements", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Installment Plans Table
export const installmentPlans = createTable("installment_plans", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  accountId: uuid("account_id")
    .references(() => accounts.id)
    .notNull(),
  description: text("description"), // e.g., "Laptop Purchase Installments"
  numberOfInstallments: integer("number_of_installments").notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).default(
    "0",
  ), // Percentage, if applicable
  startDate: date("start_date").notNull(), // Date when installments begin
  createdAt: timestamp("created_at").defaultNow(),
  // Original amounts are now stored in the balanesWithCurrencyConversions table with entity_type='installment_plan'
});

// Installment Payments Table
export const installmentPayments = createTable("installment_payments", {
  id: serial("id").primaryKey(),
  installmentPlanId: integer("installment_plan_id")
    .references(() => installmentPlans.id)
    .notNull(),
  dueDate: date("due_date").notNull(),
  paymentDate: date("payment_date"), // Nullable; set once the payment is made
  status: varchar("status", { length: 20 }).default("pending"), // e.g., pending, paid, late
  createdAt: timestamp("created_at").defaultNow(),
});
