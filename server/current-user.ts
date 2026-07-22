import { cache } from "react";
import { cookies as getRequestCookies } from "next/headers";
import { unauthorized } from "next/navigation";
import { eq } from "drizzle-orm";
import { cookies } from "@/server/cookie-definitions";
import { db } from "@/server/db";
import { characters, users } from "@/server/db/schema";

export type CurrentUser = {
  userId: string;
  username: string | null;
  email: string | null;
  characters: { id: string; name: string; worldName: string; avatarUrl: string }[];
  selectedCharacter: { id: string; name: string; worldName: string; avatarUrl: string } | null;
};

export async function getCurrentUserForSession(userId: string, selectedCharacterId: string | null): Promise<CurrentUser | null> {
  const [user] = await db
    .select({ username: users.username, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return null;
  }

  const characterRows = await db
    .select({
      id: characters.id,
      name: characters.name,
      worldName: characters.worldName,
      avatarUrl: characters.avatarUrl,
    })
    .from(characters)
    .where(eq(characters.userId, userId));

  return {
    userId,
    username: user.username,
    email: user.email,
    characters: characterRows,
    selectedCharacter: characterRows.find((character) => character.id === selectedCharacterId) ?? null,
  };
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieStore = await getRequestCookies();
  const session = await cookies.session.get(cookieStore, { allowMissing: true });

  if (!session) {
    return null;
  }

  return getCurrentUserForSession(session.userId, session.selectedCharacterId);
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  return user;
}
