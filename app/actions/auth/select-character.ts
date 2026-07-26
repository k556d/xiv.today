"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { cookies } from "@/server/cookie-definitions";
import { requireUser } from "@/server/current-user";
import { db } from "@/server/db";
import { characters } from "@/server/db/schema";
import { createServerAction } from "@/server/server-action";

const definition = {
  body: z.object({
    characterId: z.string().trim().min(1).nullable(),
  }),
  cookies: {
    session: {
      cookie: cookies.session,
      access: "write",
    },
  },
  errors: {
    characterNotFound: {
      error: {
        code: "character-not-found",
        message: "Character not found.",
      },
    },
  },
} as const;

export const selectCharacter = createServerAction(definition, async ({ body, cookies, errors, respond }) => {
  const user = await requireUser();
  const { characterId } = body;

  if (characterId) {
    const [character] = await db.select({ id: characters.id }).from(characters).where(and(
      eq(characters.id, characterId),
      eq(characters.userId, user.userId),
    )).limit(1);
    if (!character) {
      throw errors.characterNotFound();
    }
  }

  cookies.session.set({ userId: user.userId, selectedCharacterId: characterId });
  return respond();
});
