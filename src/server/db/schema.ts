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
export const currencyEnum = pgEnum("currency_type", ["USD", "EGP", "Gold"]);
export const accountTypeEnum = pgEnum("account_type", ["savings", "checking"]);

// Users Table
export const users = createTable("users", {
  user_id: serial("user_id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  salt: varchar("salt", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Accounts Table
export const accounts = createTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id")
    .references(() => users.user_id)
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
  transaction_id: serial("transaction_id").primaryKey(),
  account_id: uuid("account_id")
    .references(() => accounts.id)
    .notNull(),
  transaction_date: date("transaction_date").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  created_at: timestamp("created_at").defaultNow(),
});

// Currency Rates Table
export const currencyRates = createTable("currency_rates", {
  rate_id: serial("rate_id").primaryKey(),
  usd_rate: decimal("usd_rate", { precision: 15, scale: 6 }).notNull(), // EGP per 1 USD
  gold_g_rate: decimal("gold_g_rate", { precision: 15, scale: 6 }).notNull(), // EGP per 1g of 21 carat gold
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Snapshots Table
export const snapshots = createTable("snapshots", {
  snapshot_id: serial("snapshot_id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.user_id)
    .notNull(),
  snapshot_date: date("snapshot_date").notNull(),
  currency_rate_id: integer("currency_rate_id").references(
    () => currencyRates.rate_id,
  ),
  created_at: timestamp("created_at").defaultNow(),
});

// Snapshot_Details Table (Additional Table)
export const snapshotDetails = createTable("snapshot_details", {
  snapshot_detail_id: serial("snapshot_detail_id").primaryKey(),
  snapshot_id: integer("snapshot_id")
    .references(() => snapshots.snapshot_id, { onDelete: "cascade" })
    .notNull(),
  account_id: uuid("account_id")
    .references(() => accounts.id)
    .notNull(),
  recorded_at: timestamp("recorded_at").defaultNow(),
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

// Installment Plans Table
export const installmentPlans = createTable("installment_plans", {
  installment_plan_id: serial("installment_plan_id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.user_id)
    .notNull(),
  account_id: uuid("account_id")
    .references(() => accounts.id)
    .notNull(),
  description: text("description"), // e.g., "Laptop Purchase Installments"
  number_of_installments: integer("number_of_installments").notNull(),
  interest_rate: decimal("interest_rate", { precision: 5, scale: 2 }).default(
    "0",
  ), // Percentage, if applicable
  start_date: date("start_date").notNull(), // Date when installments begin
  created_at: timestamp("created_at").defaultNow(),
  // Original amounts are now stored in the balanesWithCurrencyConversions table with entity_type='installment_plan'
});

// Installment Payments Table
export const installmentPayments = createTable("installment_payments", {
  installment_payment_id: serial("installment_payment_id").primaryKey(),
  installment_plan_id: integer("installment_plan_id")
    .references(() => installmentPlans.installment_plan_id)
    .notNull(),
  due_date: date("due_date").notNull(),
  payment_date: date("payment_date"), // Nullable; set once the payment is made
  status: varchar("status", { length: 20 }).default("pending"), // e.g., pending, paid, late
  created_at: timestamp("created_at").defaultNow(),
});
