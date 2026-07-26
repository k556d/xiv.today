"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { createEmailVerificationCode } from "@/server/auth";
import { cookies } from "@/server/cookie-definitions";
import { requireUser } from "@/server/current-user";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { sendOneTimeCode } from "@/server/email";
import { createServerAction } from "@/server/server-action";

const definition = {
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    purpose: z.enum(["sign-in", "sign-up", "email-change"]),
  }),
  cookies: {
    emailVerification: {
      cookie: cookies.emailVerification,
      access: "write",
    },
  },
  errors: {
    emailVerificationUnavailable: {
      error: {
        code: "email-verification-unavailable",
        message: "Unable to start email verification.",
      },
    },
  },
} as const;

export const sendEmailChallenge = createServerAction(definition, async ({ body, cookies, errors, respond }) => {
  const { email, purpose } = body;
  const [emailOwner] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  const userResult: { userId: string | null; unavailable?: never } | { userId?: never; unavailable: true } = purpose === "sign-in"
    ? { userId: emailOwner?.id ?? null }
    : purpose === "sign-up"
      ? emailOwner ? { unavailable: true } : { userId: null }
      : await requireUser().then((user) => emailOwner && emailOwner.id !== user.userId
        ? { unavailable: true as const }
        : { userId: user.userId });

  if (userResult.unavailable) {
    throw errors.emailVerificationUnavailable();
  }
  if (purpose === "sign-in" && !userResult.userId) {
    return respond();
  }

  const code = createEmailVerificationCode();
  await sendOneTimeCode(email, code);
  cookies.emailVerification.set({
    userId: userResult.userId ?? null,
    email,
    purpose,
    code,
  });
  return respond();
});
