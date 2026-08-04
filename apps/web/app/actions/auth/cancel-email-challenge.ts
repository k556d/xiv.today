"use server";

import { cookies } from "@/server/cookie-definitions";
import { defineAction } from "@xiv-today/next-request";

export const cancelEmailChallenge = defineAction({
  cookies: {
    emailVerification: {
      cookie: cookies.emailVerification,
      access: "write",
    },
  },
  handler: ({ cookies }) => {
    cookies.emailVerification.clear();
  },
});
