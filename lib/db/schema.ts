import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * Reader accounts (Auth.js tables, per the official Drizzle adapter shape)
 * plus newsletter subscription state. Postgres — not Resend — is the system
 * of record for the subscriber list (ADR 0001 §4).
 */

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

/**
 * Newsletter subscriptions, double opt-in:
 * pending → (email confirmation) → subscribed → (one click) → unsubscribed.
 * `token` authorizes confirm/unsubscribe links; consent timestamps are kept
 * for audit. `userId` links a subscription to a reader account when known.
 */
export const newsletterSubscriptions = pgTable("newsletter_subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  status: text("status", {
    enum: ["pending", "subscribed", "unsubscribed"],
  })
    .notNull()
    .default("pending"),
  token: text("token")
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  requestedAt: timestamp("requestedAt", { mode: "date" }).notNull().defaultNow(),
  confirmedAt: timestamp("confirmedAt", { mode: "date" }),
  unsubscribedAt: timestamp("unsubscribedAt", { mode: "date" }),
  /** True once mirrored into the configured Resend audience. */
  syncedToResend: boolean("syncedToResend").notNull().default(false),
});
