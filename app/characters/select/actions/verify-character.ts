"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { cookies } from "@/server/cookie-definitions";
import { requireUser } from "@/server/current-user";
import { db } from "@/server/db";
import { characters, worlds } from "@/server/db/schema";
import { verifyLodestoneCharacterCode } from "@/server/lodestone";
import { createServerAction } from "@/server/server-action";

const definition = {
  body: z.object({
    profileUrl: z.string().trim().url(),
    characterId: z.string().trim().min(1),
    characterName: z.string().trim().min(1),
    avatarUrl: z.string().trim().url(),
    worldName: z.string().trim().min(1),
    skipProfileCheck: z.boolean(),
  }),
  cookies: {
    characterVerification: {
      cookie: cookies.characterVerification,
      access: "read-write",
      optional: true,
    },
    session: {
      cookie: cookies.session,
      access: "write",
    },
  },
  response: (message: string) => ({ message }),
  errors: {
    verificationChallengeExpired: {
      error: {
        code: "verification-challenge-expired",
        message: "Verification code expired. Generate a new one.",
      },
    },
    verificationCharacterMismatch: {
      error: {
        code: "verification-character-mismatch",
        message: "Verification code does not match the selected character.",
      },
    },
    unknownWorld: {
      error: {
        code: "unknown-world",
        message: "Unknown world.",
      },
    },
    lodestoneCodeNotFound: {
      error: {
        code: "lodestone-code-not-found",
        message: "Code was not found on Lodestone profile.",
      },
    },
    characterAlreadyLinked: {
      error: {
        code: "character-already-linked",
        message: "This character is already connected to another user.",
      },
    },
  },
} as const;

export const verifyCharacter = createServerAction(definition, async ({ body, cookies, errors, respond }) => {
  const user = await requireUser();
  const challenge = cookies.characterVerification.value;
  const character = body;

  if (!challenge) {
    throw errors.verificationChallengeExpired();
  }
  if (challenge.characterId !== character.characterId) {
    throw errors.verificationCharacterMismatch();
  }
  const [world] = await db.select({ name: worlds.name }).from(worlds).where(eq(worlds.name, character.worldName)).limit(1);
  if (!world) {
    throw errors.unknownWorld();
  }

  const verification = character.skipProfileCheck
    ? { matched: true }
    : await verifyLodestoneCharacterCode(character.profileUrl, challenge.code);
  if (!verification.matched) {
    throw errors.lodestoneCodeNotFound();
  }

  const [existing] = await db.select({ userId: characters.userId }).from(characters).where(eq(characters.id, character.characterId)).limit(1);
  if (existing && existing.userId !== user.userId) {
    throw errors.characterAlreadyLinked();
  }

  if (existing) {
    await db.update(characters).set({
      name: character.characterName,
      worldName: character.worldName,
      avatarUrl: character.avatarUrl,
    }).where(eq(characters.id, character.characterId));
  } else {
    await db.insert(characters).values({
      id: character.characterId,
      userId: user.userId,
      name: character.characterName,
      worldName: character.worldName,
      avatarUrl: character.avatarUrl,
    });
  }

  cookies.session.set({ userId: user.userId, selectedCharacterId: character.characterId });
  cookies.characterVerification.clear();
  return respond(character.skipProfileCheck
    ? "Character connected without profile check."
    : "Character connected.");
});
