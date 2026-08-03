"use server";

import { cookies } from "@/server/cookie-definitions";
import { createAction } from "@/server/action";

const definition = {
  cookies: {
    session: {
      cookie: cookies.session,
      access: "write",
    },
  },
} as const;

export const signOut = createAction(definition, async ({ cookies }) => {
  cookies.session.clear();
});
