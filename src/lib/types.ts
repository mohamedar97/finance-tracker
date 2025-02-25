import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { accounts, currencyEnum, accountTypeEnum } from "../server/db/schema";

// Note: Account.id is a UUID string
export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

// Extract enum values from schema enums
export type Currency = (typeof currencyEnum.enumValues)[number];
export type AccountType = (typeof accountTypeEnum.enumValues)[number];
