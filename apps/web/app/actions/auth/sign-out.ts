"use server";

import { cookies } from "@/server/cookie-definitions";
import { defineAction } from "@xiv-today/next-request";

export const signOut = defineAction({
  cookies: {
    session: {
      cookie: cookies.session,
      access: "write",
    },
  },
  handler: ({ cookies }) => {
    cookies.session.clear();
  },
});
