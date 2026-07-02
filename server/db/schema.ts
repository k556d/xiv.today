import { pgTable, text, index, uniqueIndex, primaryKey } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique(),
  username: text("username").unique(),
  passwordHash: text("password_hash"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
    uniqueIndex("accounts_user_id_provider_unique").on(account.userId, account.provider),
  ],
);

export const events = pgTable("events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizer: text("organizer").notNull().references(() => users.id),
  name: text("name"),
  date: text("date"),
  description: text("description"),
}, (event) => [
  index("events_organizer_idx").on(event.organizer),
]);
