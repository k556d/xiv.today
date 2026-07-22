"use server";

import { cookies as getRequestCookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createEmailVerificationCode, createPasswordHash, findUserByIdentifier, validatePassword, type EmailVerificationPurpose } from "@/server/auth";
import { cookies } from "@/server/cookie-definitions";
import { getCurrentUser, requireUser } from "@/server/current-user";
import { db } from "@/server/db";
import { characters, users } from "@/server/db/schema";
import { sendOneTimeCode } from "@/server/email";

type ActionFailure = { ok: false; error: string };

const credentialsSchema = z.object({
  identifier: z.string().trim().toLowerCase().min(1).max(320),
  password: z.string().min(1),
});
const registrationSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_-]{2,32}$/),
  password: z.string().min(8),
});
const emailChallengeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  purpose: z.enum(["sign-in", "sign-up", "email-change"]),
});
const codeSchema = z.string().trim().min(1);
const selectedCharacterSchema = z.string().trim().min(1).nullable();

function failure(error: string): ActionFailure {
  return { ok: false, error };
}

export async function signIn(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return failure("Missing credentials.");
  }

  const user = await findUserByIdentifier(parsed.data.identifier);
  if (!user?.passwordHash || !await validatePassword(parsed.data.password, user.passwordHash)) {
    return failure("Invalid username or password.");
  }

  const cookieStore = await getRequestCookies();
  await cookies.session.set(cookieStore, { userId: user.userId, selectedCharacterId: null });
  return { ok: true as const };
}

export async function register(formData: FormData) {
  const parsed = registrationSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const password = formData.get("password");
    if (typeof password === "string" && password.length < 8) {
      return failure("Password must be at least 8 characters.");
    }
    return failure("Username must be 2-32 characters and use only letters, numbers, underscores, or hyphens.");
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.username, parsed.data.username)).limit(1);
  if (existing) {
    return failure("Username is already taken.");
  }

  const [user] = await db.insert(users).values({ username: parsed.data.username, passwordHash: await createPasswordHash(parsed.data.password) }).returning({ id: users.id });
  const cookieStore = await getRequestCookies();
  await cookies.session.set(cookieStore, { userId: user.id, selectedCharacterId: null });
  return { ok: true as const };
}

export async function sendEmailChallenge(emailValue: string, purpose: EmailVerificationPurpose) {
  const parsed = emailChallengeSchema.safeParse({ email: emailValue, purpose });
  if (!parsed.success) {
    return failure("Enter a valid email address.");
  }

  const { email, purpose: emailPurpose } = parsed.data;
  const [emailOwner] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  const userResult: { userId: string | null; error?: never } | { userId?: never; error: string } = emailPurpose === "sign-in"
    ? { userId: emailOwner?.id ?? null }
    : emailPurpose === "sign-up"
      ? emailOwner ? { error: "Unable to start email verification." } : { userId: null }
      : await requireUser().then((user) => emailOwner && emailOwner.id !== user.userId
        ? { error: "Unable to start email verification." }
        : { userId: user.userId });

  if (userResult.error) {
    return failure(userResult.error);
  }
  if (emailPurpose === "sign-in" && !userResult.userId) {
    return { ok: true as const };
  }

  const code = createEmailVerificationCode();
  await sendOneTimeCode(email, code);
  const cookieStore = await getRequestCookies();
  await cookies.emailVerification.set(cookieStore, { userId: userResult.userId ?? null, email, purpose: emailPurpose, code });
  return { ok: true as const };
}

export async function verifyEmailChallenge(codeValue: string) {
  const cookieStore = await getRequestCookies();
  const code = codeSchema.safeParse(codeValue);
  const challenge = await cookies.emailVerification.get(cookieStore, { allowMissing: true });
  const currentUser = await getCurrentUser();

  if (!code.success || !challenge || code.data !== challenge.code) {
    return failure("Invalid or expired code.");
  }

  const userId = challenge.purpose === "sign-up"
    ? (await db.insert(users).values({ email: challenge.email }).returning({ id: users.id }))[0]?.id ?? null
    : challenge.purpose === "email-change"
      ? challenge.userId && currentUser?.userId === challenge.userId
        ? await db.update(users).set({ email: challenge.email }).where(eq(users.id, challenge.userId)).then(() => challenge.userId)
        : null
      : challenge.userId;

  if (!userId) {
    return failure("Invalid or expired code.");
  }

  const selectedCharacterId = currentUser?.userId === userId ? currentUser.selectedCharacter?.id ?? null : null;
  await cookies.session.set(cookieStore, { userId, selectedCharacterId });
  cookies.emailVerification.clear(cookieStore);
  return { ok: true as const };
}

export async function cancelEmailChallenge() {
  const cookieStore = await getRequestCookies();
  cookies.emailVerification.clear(cookieStore);
}

export async function selectCharacter(characterIdValue: string | null) {
  const user = await requireUser();
  const parsed = selectedCharacterSchema.safeParse(characterIdValue);
  if (!parsed.success) {
    return failure("Character not found.");
  }
  const characterId = parsed.data;

  if (characterId) {
    const [character] = await db.select({ id: characters.id }).from(characters).where(and(eq(characters.id, characterId), eq(characters.userId, user.userId))).limit(1);
    if (!character) {
      return failure("Character not found.");
    }
  }

  const cookieStore = await getRequestCookies();
  await cookies.session.set(cookieStore, { userId: user.userId, selectedCharacterId: characterId });
  return { ok: true as const };
}

export async function signOut() {
  const cookieStore = await getRequestCookies();
  cookies.session.clear(cookieStore);
}
