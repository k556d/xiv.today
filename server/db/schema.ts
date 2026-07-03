import { pgTable, text, index, uniqueIndex, primaryKey } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id")
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    email: text("email").unique("users_email_unique"),
    username: text("username").unique("users_username_unique"),
    passwordHash: text("password_hash"),
  },
  (user) => [primaryKey({ columns: [user.id], name: "users_pkey" })],
);

export const authAccounts = pgTable(
  "auth_accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", name: "auth_accounts_user_id_fkey" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId], name: "auth_accounts_pkey" }),
    uniqueIndex("auth_accounts_user_id_provider_unique").on(account.userId, account.provider),
  ],
);

export const events = pgTable(
  "events",
  {
    id: text("id")
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    organizerId: text("organizer_id")
      .notNull()
      .references(() => users.id, { name: "events_organizer_id_fkey" }),
    name: text("name"),
    date: text("date"),
    description: text("description"),
  },
  (event) => [
    primaryKey({ columns: [event.id], name: "events_pkey" }),
    index("events_organizer_id_idx").on(event.organizerId),
  ],
);
