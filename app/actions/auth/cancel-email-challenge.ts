"use server";

import { cookies } from "@/server/cookie-definitions";
import { createServerAction } from "@/server/server-action";

const definition = {
  cookies: {
    emailVerification: {
      cookie: cookies.emailVerification,
      access: "write",
    },
  },
} as const;

export const cancelEmailChallenge = createServerAction(definition, async ({ cookies, respond }) => {
  cookies.emailVerification.clear();
  return respond();
});
