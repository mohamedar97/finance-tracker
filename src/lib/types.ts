import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { accounts } from "../server/db/schema";

// Note: Account.id is a UUID string
export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;
