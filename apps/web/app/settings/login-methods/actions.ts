"use server";

import { z } from "zod";
import { createPasswordHash } from "@/server/auth";
import { requireUser } from "@/server/current-user";
import { findUserIdByUsername, updateUserCredentials } from "@/server/db/users";
import { defineAction } from "@xiv-today/next-request";

export const updateCredentials = defineAction({
  body: z.object({
    username: z.string().trim().toLowerCase().regex(/^[a-z0-9_-]{2,32}$/).or(z.literal("")),
    password: z.string().or(z.literal("")),
  }),
  response: (username: string | null) => ({ username }),
  errors: {
    credentialsRequired: {
      code: "credentials-required",
      message: "Enter a username or password to update.",
    },
    passwordTooShort: {
      code: "password-too-short",
      message: "Password must be at least 8 characters.",
    },
    usernameTaken: {
      code: "username-taken",
      message: "Username is already taken.",
    },
  },
  handler: async ({ body, errors, respond }) => {
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
      const ownerId = await findUserIdByUsername(username);
      if (ownerId && ownerId !== user.userId) {
        throw errors.usernameTaken();
      }
    }

    const passwordHash = password ? await createPasswordHash(password) : undefined;
    await updateUserCredentials(user.userId, {
      ...(username ? { username } : {}),
      ...(passwordHash ? { passwordHash } : {}),
    });
    return respond(username);
  },
});
