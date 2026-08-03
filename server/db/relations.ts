import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  worlds: {
    characters: r.many.characters({
      from: r.worlds.name,
      to: r.characters.worldName,
    }),
  },
  users: {
    characters: r.many.characters({
      from: r.users.id,
      to: r.characters.userId,
    }),
    linkedAccounts: r.many.linkedAccounts({
      from: r.users.id,
      to: r.linkedAccounts.userId,
    }),
  },
  characters: {
    user: r.one.users({
      from: r.characters.userId,
      to: r.users.id,
    }),
    events: r.many.events({
      from: r.characters.id,
      to: r.events.organizerId,
    }),
  },
  linkedAccounts: {
    user: r.one.users({
      from: r.linkedAccounts.userId,
      to: r.users.id,
    }),
  },
  events: {
    organizer: r.one.characters({
      from: r.events.organizerId,
      to: r.characters.id,
    }),
  },
}));
