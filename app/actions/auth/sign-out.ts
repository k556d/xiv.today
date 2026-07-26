"use server";

import { cookies } from "@/server/cookie-definitions";
import { createServerAction } from "@/server/server-action";

const definition = {
  cookies: {
    session: {
      cookie: cookies.session,
      access: "write",
    },
  },
} as const;

export const signOut = createServerAction(definition, async ({ cookies, respond }) => {
  cookies.session.clear();
  return respond();
});
