"use server";

import { cookies as getRequestCookies } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createCharacterVerificationCode } from "@/server/auth";
import { cookies } from "@/server/cookie-definitions";
import { requireUser } from "@/server/current-user";
import { db } from "@/server/db";
import { characters, worlds } from "@/server/db/schema";
import { verifyLodestoneCharacterCode } from "@/server/lodestone";

type VerifyCharacterResult =
  | { ok: false; error: string }
  | { ok: true; verified: false; message: string }
  | { ok: true; verified: true; message: string };

const characterIdSchema = z.string().trim().min(1);
const characterSchema = z.object({
  profileUrl: z.string().trim().url(),
  characterId: characterIdSchema,
  characterName: z.string().trim().min(1),
  avatarUrl: z.string().trim().url(),
  worldName: z.string().trim().min(1),
  skipProfileCheck: z.boolean(),
});

export async function createCharacterVerificationChallenge(characterIdValue: string) {
  await requireUser();
  const parsed = characterIdSchema.safeParse(characterIdValue);
  if (!parsed.success) {
    return { ok: false as const, error: "Character ID is required." };
  }

  const code = createCharacterVerificationCode(parsed.data);
  const cookieStore = await getRequestCookies();
  await cookies.characterVerification.set(cookieStore, { characterId: parsed.data, code });
  return { ok: true as const, code };
}

export async function verifyCharacter(input: {
  profileUrl: string;
  characterId: string;
  characterName: string;
  avatarUrl: string | null;
  worldName: string;
  skipProfileCheck: boolean;
}): Promise<VerifyCharacterResult> {
  const user = await requireUser();
  const cookieStore = await getRequestCookies();
  const challenge = await cookies.characterVerification.get(cookieStore, { allowMissing: true });
  const parsed = characterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Character details are required." };
  }
  if (!challenge) {
    return { ok: false as const, error: "Verification code expired. Generate a new one." };
  }

  const character = parsed.data;
  if (challenge.characterId !== character.characterId) {
    return { ok: false as const, error: "Verification code does not match the selected character." };
  }

  const [world] = await db.select({ name: worlds.name }).from(worlds).where(eq(worlds.name, character.worldName)).limit(1);
  if (!world) {
    return { ok: false as const, error: "Unknown world." };
  }

  try {
    const verification = character.skipProfileCheck
      ? { matched: true }
      : await verifyLodestoneCharacterCode(character.profileUrl, challenge.code);
    if (!verification.matched) {
      return { ok: true as const, verified: false, message: "Code was not found on Lodestone profile." };
    }

    const [existing] = await db.select({ userId: characters.userId }).from(characters).where(eq(characters.id, character.characterId)).limit(1);
    if (existing && existing.userId !== user.userId) {
      return { ok: false as const, error: "This character is already connected to another user." };
    }

    if (existing) {
      await db.update(characters).set({ name: character.characterName, worldName: character.worldName, avatarUrl: character.avatarUrl }).where(eq(characters.id, character.characterId));
    } else {
      await db.insert(characters).values({ id: character.characterId, userId: user.userId, name: character.characterName, worldName: character.worldName, avatarUrl: character.avatarUrl });
    }

    await cookies.session.set(cookieStore, { userId: user.userId, selectedCharacterId: character.characterId });
    cookies.characterVerification.clear(cookieStore);
    return { ok: true as const, verified: true, message: character.skipProfileCheck ? "Character connected without profile check." : "Character connected." };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Verification failed." };
  }
}
