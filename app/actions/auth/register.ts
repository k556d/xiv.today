"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { createPasswordHash } from "@/server/auth";
import { cookies } from "@/server/cookie-definitions";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { createServerAction } from "@/server/server-action";

const definition = {
  body: z.object({
    username: z.string().trim().toLowerCase().regex(/^[a-z0-9_-]{2,32}$/),
    password: z.string().min(8),
  }),
  cookies: {
    session: {
      cookie: cookies.session,
      access: "write",
    },
  },
  errors: {
    usernameTaken: {
      error: {
        code: "username-taken",
        message: "Username is already taken.",
      },
    },
  },
} as const;

export const register = createServerAction(definition, async ({ body, cookies, errors, respond }) => {
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.username, body.username)).limit(1);
  if (existing) {
    throw errors.usernameTaken();
  }

  const [user] = await db.insert(users).values({
    username: body.username,
    passwordHash: await createPasswordHash(body.password),
  }).returning({ id: users.id });
  cookies.session.set({ userId: user.id, selectedCharacterId: null });
  return respond();
});
