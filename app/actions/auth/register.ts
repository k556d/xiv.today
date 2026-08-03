"use server";

import { z } from "zod";
import { createPasswordHash } from "@/server/auth";
import { cookies } from "@/server/cookie-definitions";
import { createPasswordUser, findUserIdByUsername } from "@/server/db/users";
import { createAction } from "@/server/action";

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

export const register = createAction(definition, async ({ body, cookies, errors }) => {
  if (await findUserIdByUsername(body.username)) {
    throw errors.usernameTaken();
  }

  const user = await createPasswordUser(body.username, await createPasswordHash(body.password));
  cookies.session.set({ userId: user.id, selectedCharacterId: null });
});
