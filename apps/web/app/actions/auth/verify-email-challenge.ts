"use server";

import { z } from "zod";
import { cookies } from "@/server/cookie-definitions";
import { getCurrentUser } from "@/server/current-user";
import { createEmailUser, updateUserEmail } from "@/server/db/users";
import { defineAction } from "@xiv-today/next-request/action";

const definition = defineAction({
  body: z.object({
    code: z.string().trim().min(1),
  }),
  cookies: {
    emailVerification: {
      cookie: cookies.emailVerification,
      access: "read-write",
      optional: true,
    },
    session: {
      cookie: cookies.session,
      access: "write",
    },
  },
  errors: {
    invalidOrExpiredCode: {
      error: {
        code: "invalid-or-expired-code",
        message: "Invalid or expired code.",
      },
    },
  },
});

export const verifyEmailChallenge = definition.handle(async ({ body, cookies, errors }) => {
  const challenge = cookies.emailVerification.value;
  const currentUser = await getCurrentUser();

  if (!challenge || body.code !== challenge.code) {
    throw errors.invalidOrExpiredCode();
  }

  const userId = challenge.purpose === "sign-up"
    ? (await createEmailUser(challenge.email))?.id ?? null
    : challenge.purpose === "email-change"
      ? challenge.userId && currentUser?.userId === challenge.userId
        ? await updateUserEmail(challenge.userId, challenge.email).then(() => challenge.userId)
        : null
      : challenge.userId;

  if (!userId) {
    throw errors.invalidOrExpiredCode();
  }

  const selectedCharacterId = currentUser?.userId === userId ? currentUser.selectedCharacter?.id ?? null : null;
  cookies.session.set({ userId, selectedCharacterId });
  cookies.emailVerification.clear();
});
