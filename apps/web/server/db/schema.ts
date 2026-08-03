import {
  pgTable,
  text,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id")
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    username: text("username").unique("users_username_unique"),
    passwordHash: text("password_hash"),
    email: text("email").unique("users_email_unique"),
  },
  (user) => [primaryKey({ columns: [user.id], name: "users_pkey" })],
);

export const linkedAccounts = pgTable(
  "linked_accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", name: "linked_accounts_user_id_fkey" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url").notNull(),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId], name: "linked_accounts_pkey" }),
    uniqueIndex("linked_accounts_user_id_provider_unique").on(account.userId, account.provider),
  ],
);

export const worlds = pgTable(
  "worlds",
  {
    name: text("name").notNull(),
    dataCenter: text("data_center").notNull(),
  },
  (world) => [primaryKey({ columns: [world.name], name: "worlds_pkey" })],
);

export const characters = pgTable(
  "characters",
  {
    id: text("id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", name: "characters_user_id_fkey" }),
    name: text("name").notNull(),
    worldName: text("world_name")
      .notNull()
      .references(() => worlds.name, { name: "characters_world_name_fkey" }),
    avatarUrl: text("avatar_url").notNull(),
  },
  (character) => [primaryKey({ columns: [character.id], name: "characters_pkey" })],
);

export const events = pgTable(
  "events",
  {
    id: text("id")
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    organizerId: text("organizer_id")
      .notNull()
      .references(() => characters.id, { name: "events_organizer_id_fkey" }),
    name: text("name"),
    date: text("date"),
    description: text("description"),
  },
  (event) => [
    primaryKey({ columns: [event.id], name: "events_pkey" }),
    index("events_organizer_id_idx").on(event.organizerId),
  ],
);
