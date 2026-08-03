"use server";

import { z } from "zod";
import { cookies } from "@/server/cookie-definitions";
import { requireUser } from "@/server/current-user";
import { userOwnsCharacter } from "@/server/db/characters";
import { defineAction } from "@xiv-today/next-request/action";

const definition = defineAction({
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
});

export const selectCharacter = definition.handle(async ({ body, cookies, errors }) => {
  const user = await requireUser();
  const { characterId } = body;

  if (characterId) {
    if (!await userOwnsCharacter(user.userId, characterId)) {
      throw errors.characterNotFound();
    }
  }

  cookies.session.set({ userId: user.userId, selectedCharacterId: characterId });
});
