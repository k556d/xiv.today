import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    authAccounts: r.many.authAccounts({
      from: r.users.id,
      to: r.authAccounts.userId,
    }),
    events: r.many.events({
      from: r.users.id,
      to: r.events.organizerId,
    }),
  },
  authAccounts: {
    user: r.one.users({
      from: r.authAccounts.userId,
      to: r.users.id,
    }),
  },
  events: {
    organizer: r.one.users({
      from: r.events.organizerId,
      to: r.users.id,
    }),
  },
}));
