"use server";

import { cookies } from "@/server/cookie-definitions";
import { defineAction } from "@xiv-today/next-request/action";

const definition = defineAction({
  cookies: {
    session: {
      cookie: cookies.session,
      access: "write",
    },
  },
});

export const signOut = definition.handle(({ cookies }) => {
  cookies.session.clear();
});
