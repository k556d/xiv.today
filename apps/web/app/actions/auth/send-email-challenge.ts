"use server";

import { z } from "zod";
import { createEmailVerificationCode } from "@/server/auth";
import { cookies } from "@/server/cookie-definitions";
import { requireUser } from "@/server/current-user";
import { findUserIdByEmail } from "@/server/db/users";
import { sendOneTimeCode } from "@/server/email";
import { defineAction } from "@xiv-today/next-request/action";

const definition = defineAction({
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
});

export const sendEmailChallenge = definition.handle(async ({ body, cookies, errors }) => {
  const { email, purpose } = body;
  const emailOwnerId = await findUserIdByEmail(email);
  const userResult: { userId: string | null; unavailable?: never } | { userId?: never; unavailable: true } = purpose === "sign-in"
    ? { userId: emailOwnerId }
    : purpose === "sign-up"
      ? emailOwnerId ? { unavailable: true } : { userId: null }
      : await requireUser().then((user) => emailOwnerId && emailOwnerId !== user.userId
        ? { unavailable: true as const }
        : { userId: user.userId });

  if (userResult.unavailable) {
    throw errors.emailVerificationUnavailable();
  }
  if (purpose === "sign-in" && !userResult.userId) {
    return;
  }

  const code = createEmailVerificationCode();
  await sendOneTimeCode(email, code);
  cookies.emailVerification.set({
    userId: userResult.userId ?? null,
    email,
    purpose,
    code,
  });
});
