import { defineJwtCookie } from "@/server/cookie-factories";
import { z } from "zod";
import { normalizeReturnTo } from "@/server/app-url";

export const cookies = {
  characterVerification: defineJwtCookie({
    name: "character-verification",
    duration: { days: 1 },
    schema: z.object({
      characterId: z.string(),
      code: z.string(),
    }),
  }),
  emailVerification: defineJwtCookie({
    name: "email-verification",
    duration: { days: 1 },
    schema: z.object({
      userId: z.string().nullable(),
      email: z.string(),
      purpose: z.enum(["sign-in", "sign-up", "email-change"]),
      code: z.string(),
    }),
  }),
  authFlow: defineJwtCookie({
    name: "auth-flow",
    duration: { minutes: 10 },
    schema: z.discriminatedUnion("intent", [
      z.object({
        intent: z.literal("sign-in"),
        nonce: z.string(),
        returnTo: z.string().transform(normalizeReturnTo),
      }),
      z.object({
        intent: z.literal("link"),
        nonce: z.string(),
        returnTo: z.string().transform(normalizeReturnTo),
        userId: z.string(),
      }),
    ]),
  }),
  oauth: defineJwtCookie({
    name: "oauth",
    duration: { minutes: 10 },
    schema: z.object({
      state: z.string(),
      codeVerifier: z.string().optional(),
      callbackUrl: z.string().url(),
      nonce: z.string(),
    }),
  }),
  session: defineJwtCookie({
    name: "user-session",
    duration: { days: 30 },
    schema: z.object({
      userId: z.string(),
      selectedCharacterId: z.string().nullable(),
    }),
  }),
} as const;
