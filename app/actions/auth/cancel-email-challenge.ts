"use server";

import { cookies } from "@/server/cookie-definitions";
import { createAction } from "@/server/action";

const definition = {
  cookies: {
    emailVerification: {
      cookie: cookies.emailVerification,
      access: "write",
    },
  },
} as const;

export const cancelEmailChallenge = createAction(definition, async ({ cookies }) => {
  cookies.emailVerification.clear();
});
