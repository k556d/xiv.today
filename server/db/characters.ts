import { and, eq } from "drizzle-orm";
import { db } from "./index";
import { characters } from "./schema";

export function findCharactersByUserId(userId: string) {
  return db
    .select()
    .from(characters)
    .where(eq(characters.userId, userId));
}

export async function findCharacterOwnerId(characterId: string): Promise<string | null> {
  const [character] = await db
    .select({ userId: characters.userId })
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1);

  return character?.userId ?? null;
}

export async function userOwnsCharacter(userId: string, characterId: string): Promise<boolean> {
  const [character] = await db
    .select({ id: characters.id })
    .from(characters)
    .where(and(eq(characters.id, characterId), eq(characters.userId, userId)))
    .limit(1);

  return Boolean(character);
}

export async function createCharacter(character: typeof characters.$inferInsert): Promise<void> {
  await db.insert(characters).values(character);
}

export async function updateCharacter(
  characterId: string,
  fields: Pick<typeof characters.$inferInsert, "name" | "worldName" | "avatarUrl">,
): Promise<void> {
  await db
    .update(characters)
    .set(fields)
    .where(eq(characters.id, characterId));
}
