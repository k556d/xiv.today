import bcrypt from "bcryptjs";

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
export async function validatePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createPasswordHash(password: string) {
  return bcrypt.hash(password, 12);
}
