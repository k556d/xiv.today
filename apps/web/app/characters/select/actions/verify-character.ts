"use server";

import { z } from "zod";
import { cookies } from "@/server/cookie-definitions";
import { requireUser } from "@/server/current-user";
import {
  createCharacter,
  findCharacterOwnerId,
  updateCharacter,
} from "@/server/db/characters";
import { worldExists } from "@/server/db/worlds";
import { verifyLodestoneCharacterCode } from "@/server/lodestone";
import { defineAction } from "@xiv-today/next-request/action";

const definition = defineAction({
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
});

export const verifyCharacter = definition.handle(async ({ body, cookies, errors, respond }) => {
  const user = await requireUser();
  const challenge = cookies.characterVerification.value;
  const character = body;

  if (!challenge) {
    throw errors.verificationChallengeExpired();
  }
  if (challenge.characterId !== character.characterId) {
    throw errors.verificationCharacterMismatch();
  }
  if (!await worldExists(character.worldName)) {
    throw errors.unknownWorld();
  }

  const verification = character.skipProfileCheck
    ? { matched: true }
    : await verifyLodestoneCharacterCode(character.profileUrl, challenge.code);
  if (!verification.matched) {
    throw errors.lodestoneCodeNotFound();
  }

  const ownerId = await findCharacterOwnerId(character.characterId);
  if (ownerId && ownerId !== user.userId) {
    throw errors.characterAlreadyLinked();
  }

  if (ownerId) {
    await updateCharacter(character.characterId, {
      name: character.characterName,
      worldName: character.worldName,
      avatarUrl: character.avatarUrl,
    });
  } else {
    await createCharacter({
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
