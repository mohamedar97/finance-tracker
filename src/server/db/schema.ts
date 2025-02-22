import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  date,
  boolean,
  pgTableCreator,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `finance-tracker_${name}`);

// Users Table
export const users = createTable("users", {
  user_id: serial("user_id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Accounts Table
export const accounts = createTable("accounts", {
  account_id: serial("account_id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.user_id)
    .notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // e.g., 'savings', 'checking', 'cash', 'gold', 'credit_card', 'loan', 'mortgage'
  is_liability: boolean("is_liability").notNull().default(false), // true for debts/liabilities, false for assets
  currency: varchar("currency", { length: 3 }).notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"),
  created_at: timestamp("created_at").defaultNow(),
});

// Transactions Table
export const transactions = createTable("transactions", {
  transaction_id: serial("transaction_id").primaryKey(),
  account_id: integer("account_id")
    .references(() => accounts.account_id)
    .notNull(),
  transaction_date: date("transaction_date").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  original_currency: varchar("original_currency", { length: 3 }).notNull(),
  conversion_rate: decimal("conversion_rate", {
    precision: 10,
    scale: 6,
  }).default("1.0"),
  created_at: timestamp("created_at").defaultNow(),
});

// CurrencyRates Table
export const currencyRates = createTable("currency_rates", {
  rate_id: serial("rate_id").primaryKey(),
  base_currency: varchar("base_currency", { length: 3 }).notNull(),
  target_currency: varchar("target_currency", { length: 3 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 6 }).notNull(),
  updated_at: timestamp("updated_at").notNull(),
});

// Snapshots Table
export const snapshots = createTable("snapshots", {
  snapshot_id: serial("snapshot_id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.user_id)
    .notNull(),
  snapshot_date: date("snapshot_date").notNull(),
  net_liquid: decimal("net_liquid", { precision: 12, scale: 2 }),
  net_savings: decimal("net_savings", { precision: 12, scale: 2 }),
  net_total: decimal("net_total", { precision: 12, scale: 2 }),
  created_at: timestamp("created_at").defaultNow(),
});

// BankStatements Table (Optional)
export const bankStatements = createTable("bank_statements", {
  statement_id: serial("statement_id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.user_id)
    .notNull(),
  file_name: text("file_name").notNull(),
  file_path: text("file_path").notNull(),
  uploaded_at: timestamp("uploaded_at").defaultNow(),
});

// Snapshot_Details Table (Additional Table)
export const snapshotDetails = createTable("snapshot_details", {
  snapshot_detail_id: serial("snapshot_detail_id").primaryKey(),
  snapshot_id: integer("snapshot_id")
    .references(() => snapshots.snapshot_id, { onDelete: "cascade" })
    .notNull(),
  account_id: integer("account_id")
    .references(() => accounts.account_id)
    .notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull(),
  conversion_rate: decimal("conversion_rate", {
    precision: 10,
    scale: 6,
  }).default("1.0"),
  recorded_at: timestamp("recorded_at").defaultNow(),
});

// Installment Plans Table
export const installmentPlans = createTable("installment_plans", {
  installment_plan_id: serial("installment_plan_id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.user_id)
    .notNull(),
  account_id: integer("account_id")
    .references(() => accounts.account_id)
    .notNull(),
  description: text("description"), // e.g., "Laptop Purchase Installments"
  original_amount: decimal("original_amount", {
    precision: 12,
    scale: 2,
  }).notNull(),
  number_of_installments: integer("number_of_installments").notNull(),
  interest_rate: decimal("interest_rate", { precision: 5, scale: 2 }).default(
    "0",
  ), // Percentage, if applicable
  start_date: date("start_date").notNull(), // Date when installments begin
  created_at: timestamp("created_at").defaultNow(),
});

// Installment Payments Table
export const installmentPayments = createTable("installment_payments", {
  installment_payment_id: serial("installment_payment_id").primaryKey(),
  installment_plan_id: integer("installment_plan_id")
    .references(() => installmentPlans.installment_plan_id)
    .notNull(),
  due_date: date("due_date").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  payment_date: date("payment_date"), // Nullable; set once the payment is made
  status: varchar("status", { length: 20 }).default("pending"), // e.g., pending, paid, late
  created_at: timestamp("created_at").defaultNow(),
});
