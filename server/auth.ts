import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

export function createCharacterVerificationCode(characterId: string) {
  const random = Array.from(crypto.getRandomValues(new Uint8Array(6)), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");

  return `xiv.today:${characterId}:${random}`;
}

export type EmailVerificationPurpose = "sign-in" | "sign-up" | "email-change";

export function createEmailVerificationCode() {
  return crypto.getRandomValues(new Uint32Array(1))[0].toString().slice(-6).padStart(6, "0");
}


export async function findUserByIdentifier(identifier: string) {
  const [user] = await db
    .select({
      userId: users.id,
      username: users.username,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(or(eq(users.username, identifier), eq(users.email, identifier)))
    .limit(1);

  return user ?? null;
}

export async function validatePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createPasswordHash(password: string) {
  return bcrypt.hash(password, 12);
}
