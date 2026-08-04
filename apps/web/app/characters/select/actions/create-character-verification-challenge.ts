"use server";

import { z } from "zod";
import { createCharacterVerificationCode } from "@/server/auth";
import { cookies } from "@/server/cookie-definitions";
import { requireUser } from "@/server/current-user";
import { defineAction } from "@xiv-today/next-request";

export const createCharacterVerificationChallenge = defineAction({
  body: z.object({ characterId: z.string().trim().min(1) }),
  cookies: {
    characterVerification: {
      cookie: cookies.characterVerification,
      access: "write",
    },
  },
  response: (code: string) => ({ code }),
  handler: async ({ body, cookies, respond }) => {
    await requireUser();
    const code = createCharacterVerificationCode(body.characterId);
    cookies.characterVerification.set({ characterId: body.characterId, code });
    return respond(code);
  },
});
