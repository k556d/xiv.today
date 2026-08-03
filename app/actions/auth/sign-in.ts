"use server";

import { z } from "zod";
import { validatePassword } from "@/server/auth";
import { cookies } from "@/server/cookie-definitions";
import { findUserByIdentifier } from "@/server/db/users";
import { createAction } from "@/server/action";

const definition = {
  body: z.object({
    identifier: z.string().trim().toLowerCase().min(1).max(320),
    password: z.string().min(1),
  }),
  cookies: {
    session: {
      cookie: cookies.session,
      access: "write",
    },
  },
  errors: {
    invalidCredentials: {
      error: {
        code: "invalid-credentials",
        message: "Invalid username or password.",
      },
    },
  },
} as const;

export const signIn = createAction(definition, async ({ body, cookies, errors }) => {
  const user = await findUserByIdentifier(body.identifier);
  if (!user?.passwordHash || !await validatePassword(body.password, user.passwordHash)) {
    throw errors.invalidCredentials();
  }

  cookies.session.set({ userId: user.id, selectedCharacterId: null });
});
