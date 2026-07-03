import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { authAccounts, users } from "@/server/db/schema";

export const sessionCookieName = "xiv_session";
export const oauthStateCookieName = "xiv_oauth_state";
export const oauthReturnToCookieName = "xiv_oauth_return_to";
export const sessionDurationMs = 1000 * 60 * 60 * 24 * 30;

type SessionJwtPayload = {
  userId: string;
  exp: number;
  jti: string;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is required");
  }

  return secret;
}

function base64UrlEncode(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64url");
}

function base64UrlEncodeJson(value: unknown) {
  return base64UrlEncode(new TextEncoder().encode(JSON.stringify(value)));
}

async function hmacSha256(input: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
  return base64UrlEncode(new Uint8Array(signature));
}

async function signSessionJwt(payload: SessionJwtPayload) {
  const header = base64UrlEncodeJson({ alg: "HS256", typ: "JWT" });
  const body = base64UrlEncodeJson(payload);
  const data = `${header}.${body}`;
  const signature = await hmacSha256(data);

  return `${data}.${signature}`;
}

async function verifySessionJwt(token: string) {
  const [headerPart, payloadPart, signaturePart] = token.split(".");

  if (!headerPart || !payloadPart || !signaturePart) {
    return null;
  }

  const data = `${headerPart}.${payloadPart}`;
  const expectedSignature = await hmacSha256(data);

  if (expectedSignature !== signaturePart) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as SessionJwtPayload;

  if (typeof payload.userId !== "string" || typeof payload.exp !== "number") {
    return null;
  }

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export async function findUserByUsername(username: string) {
  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return user ?? null;
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createPasswordHash(password: string) {
  return bcrypt.hash(password, 10);
}

export async function resolveDiscordUserId(providerAccountId: string) {
  const [linkedAccount] = await db
    .select({ userId: authAccounts.userId })
    .from(authAccounts)
    .where(
      and(
        eq(authAccounts.provider, "discord"),
        eq(authAccounts.providerAccountId, providerAccountId),
      ),
    )
    .limit(1);

  if (linkedAccount) {
    return linkedAccount.userId;
  }

  const [createdUser] = await db
    .insert(users)
    .values({ username: null })
    .returning({ id: users.id });

  await db.insert(authAccounts).values({
    userId: createdUser.id,
    provider: "discord",
    providerAccountId,
  });

  return createdUser.id;
}

export async function createSession(userId: string) {
  const exp = Math.floor((Date.now() + sessionDurationMs) / 1000);
  const token = await signSessionJwt({
    userId,
    exp,
    jti: crypto.randomUUID(),
  });

  return { token, expiresAt: new Date(exp * 1000) };
}

export async function getSessionUserId(token: string) {
  const payload = await verifySessionJwt(token);
  return payload?.userId ?? null;
}
