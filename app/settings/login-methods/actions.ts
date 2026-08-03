"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { createPasswordHash } from "@/server/auth";
import { requireUser } from "@/server/current-user";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { createAction } from "@/server/action";

const definition = {
  body: z.object({
    username: z.string().trim().toLowerCase().regex(/^[a-z0-9_-]{2,32}$/).or(z.literal("")),
    password: z.string().or(z.literal("")),
  }),
  response: (username: string | null) => ({ username }),
  errors: {
    credentialsRequired: {
      error: {
        code: "credentials-required",
        message: "Enter a username or password to update.",
      },
    },
    passwordTooShort: {
      error: {
        code: "password-too-short",
        message: "Password must be at least 8 characters.",
      },
    },
    usernameTaken: {
      error: {
        code: "username-taken",
        message: "Username is already taken.",
      },
    },
  },
} as const;

export const updateCredentials = createAction(definition, async ({ body, errors, respond }) => {
  const user = await requireUser();
  const username = body.username || null;
  const password = body.password || null;

  if (!username && !password) {
    throw errors.credentialsRequired();
  }
  if (password && password.length < 8) {
    throw errors.passwordTooShort();
  }

  if (username) {
    const [owner] = await db.select({ userId: users.id }).from(users).where(eq(users.username, username)).limit(1);
    if (owner && owner.userId !== user.userId) {
      throw errors.usernameTaken();
    }
  }

  const passwordHash = password ? await createPasswordHash(password) : undefined;
  await db.update(users).set({
    ...(username ? { username } : {}),
    ...(passwordHash ? { passwordHash } : {}),
  }).where(eq(users.id, user.userId));
  return respond(username);
});
