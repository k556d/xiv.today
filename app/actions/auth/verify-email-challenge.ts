"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { cookies } from "@/server/cookie-definitions";
import { getCurrentUser } from "@/server/current-user";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { createAction } from "@/server/action";

const definition = {
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
} as const;

export const verifyEmailChallenge = createAction(definition, async ({ body, cookies, errors }) => {
  const challenge = cookies.emailVerification.value;
  const currentUser = await getCurrentUser();

  if (!challenge || body.code !== challenge.code) {
    throw errors.invalidOrExpiredCode();
  }

  const userId = challenge.purpose === "sign-up"
    ? (await db.insert(users).values({ email: challenge.email }).returning({ id: users.id }))[0]?.id ?? null
    : challenge.purpose === "email-change"
      ? challenge.userId && currentUser?.userId === challenge.userId
        ? await db.update(users).set({ email: challenge.email }).where(eq(users.id, challenge.userId)).then(() => challenge.userId)
        : null
      : challenge.userId;

  if (!userId) {
    throw errors.invalidOrExpiredCode();
  }

  const selectedCharacterId = currentUser?.userId === userId ? currentUser.selectedCharacter?.id ?? null : null;
  cookies.session.set({ userId, selectedCharacterId });
  cookies.emailVerification.clear();
});
