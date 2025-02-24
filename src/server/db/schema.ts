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
  primaryKey,
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

// Currencies Table
export const currencies = createTable("currencies", {
  currency_code: varchar("currency_code", { length: 10 }).primaryKey(),
  currency_name: varchar("currency_name", { length: 50 }).notNull(),
  symbol: varchar("symbol", { length: 10 }),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

// Exchange Rates Table
export const exchangeRates = createTable("exchange_rates", {
  rate_id: serial("rate_id").primaryKey(),
  from_currency: varchar("from_currency", { length: 10 })
    .references(() => currencies.currency_code)
    .notNull(),
  to_currency: varchar("to_currency", { length: 10 })
    .references(() => currencies.currency_code)
    .notNull(),
  rate: decimal("rate", { precision: 15, scale: 6 }).notNull(),
  rate_date: date("rate_date").notNull(),
  source: varchar("source", { length: 100 }),
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
  created_at: timestamp("created_at").defaultNow(),
});

// Account Balances (Multi-currency support)
export const accountBalances = createTable(
  "account_balances",
  {
    account_id: integer("account_id")
      .references(() => accounts.account_id)
      .notNull(),
    currency_code: varchar("currency_code", { length: 10 })
      .references(() => currencies.currency_code)
      .notNull(),
    balance: decimal("balance", { precision: 15, scale: 6 })
      .notNull()
      .default("0"),
    last_updated: timestamp("last_updated").defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.account_id, table.currency_code] }),
    };
  },
);

// Transactions Table
export const transactions = createTable("transactions", {
  transaction_id: serial("transaction_id").primaryKey(),
  account_id: integer("account_id")
    .references(() => accounts.account_id)
    .notNull(),
  transaction_date: date("transaction_date").notNull(),
  amount: decimal("amount", { precision: 15, scale: 6 }).notNull(),
  currency_code: varchar("currency_code", { length: 10 })
    .references(() => currencies.currency_code)
    .notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  created_at: timestamp("created_at").defaultNow(),
});

// Transaction Conversions (for when a transaction affects multiple currencies)
export const transactionConversions = createTable("transaction_conversions", {
  conversion_id: serial("conversion_id").primaryKey(),
  transaction_id: integer("transaction_id")
    .references(() => transactions.transaction_id)
    .notNull(),
  from_currency: varchar("from_currency", { length: 10 })
    .references(() => currencies.currency_code)
    .notNull(),
  to_currency: varchar("to_currency", { length: 10 })
    .references(() => currencies.currency_code)
    .notNull(),
  from_amount: decimal("from_amount", { precision: 15, scale: 6 }).notNull(),
  to_amount: decimal("to_amount", { precision: 15, scale: 6 }).notNull(),
  rate_used: decimal("rate_used", { precision: 15, scale: 6 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Snapshots Table
export const snapshots = createTable("snapshots", {
  snapshot_id: serial("snapshot_id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.user_id)
    .notNull(),
  snapshot_date: date("snapshot_date").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Snapshot Rates (records exchange rates at snapshot time)
export const snapshotRates = createTable(
  "snapshot_rates",
  {
    snapshot_id: integer("snapshot_id")
      .references(() => snapshots.snapshot_id, { onDelete: "cascade" })
      .notNull(),
    from_currency: varchar("from_currency", { length: 10 })
      .references(() => currencies.currency_code)
      .notNull(),
    to_currency: varchar("to_currency", { length: 10 })
      .references(() => currencies.currency_code)
      .notNull(),
    rate: decimal("rate", { precision: 15, scale: 6 }).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.snapshot_id, table.from_currency, table.to_currency],
      }),
    };
  },
);

// Snapshot Values (supports multiple currencies)
export const snapshotValues = createTable(
  "snapshot_values",
  {
    snapshot_id: integer("snapshot_id")
      .references(() => snapshots.snapshot_id, { onDelete: "cascade" })
      .notNull(),
    currency_code: varchar("currency_code", { length: 10 })
      .references(() => currencies.currency_code)
      .notNull(),
    net_liquid: decimal("net_liquid", { precision: 15, scale: 6 }),
    net_savings: decimal("net_savings", { precision: 15, scale: 6 }),
    net_total: decimal("net_total", { precision: 15, scale: 6 }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.snapshot_id, table.currency_code] }),
    };
  },
);

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
  currency_code: varchar("currency_code", { length: 10 })
    .references(() => currencies.currency_code)
    .notNull(),
  balance: decimal("balance", { precision: 15, scale: 6 }).notNull(),
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
  currency_code: varchar("currency_code", { length: 10 })
    .references(() => currencies.currency_code)
    .notNull(),
  original_amount: decimal("original_amount", {
    precision: 15,
    scale: 6,
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
  currency_code: varchar("currency_code", { length: 10 })
    .references(() => currencies.currency_code)
    .notNull(),
  amount: decimal("amount", { precision: 15, scale: 6 }).notNull(),
  payment_date: date("payment_date"), // Nullable; set once the payment is made
  status: varchar("status", { length: 20 }).default("pending"), // e.g., pending, paid, late
  created_at: timestamp("created_at").defaultNow(),
});
