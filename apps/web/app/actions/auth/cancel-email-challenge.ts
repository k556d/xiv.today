"use server";

import { cookies } from "@/server/cookie-definitions";
import { defineAction } from "@xiv-today/next-request/action";

const definition = defineAction({
  cookies: {
    emailVerification: {
      cookie: cookies.emailVerification,
      access: "write",
    },
  },
});

export const cancelEmailChallenge = definition.handle(({ cookies }) => {
  cookies.emailVerification.clear();
});
