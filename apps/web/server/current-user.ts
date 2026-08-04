import { cache } from "react";
import { cookies as getRequestCookies } from "next/headers";
import { unauthorized } from "next/navigation";
import { cookies } from "@/server/cookie-definitions";
import { findCharactersByUserId } from "@/server/db/characters";
import { findUserById } from "@/server/db/users";

export type CurrentUser = {
  userId: string;
  username: string | null;
  email: string | null;
  characters: { id: string; name: string; worldName: string; avatarUrl: string }[];
  selectedCharacter: { id: string; name: string; worldName: string; avatarUrl: string } | null;
};

export async function getCurrentUserForSession(userId: string, selectedCharacterId: string | null): Promise<CurrentUser | null> {
  const user = await findUserById(userId);

  if (!user) {
    return null;
  }

  const characterRows = await findCharactersByUserId(userId);
  const userCharacters = characterRows.map(({ id, name, worldName, avatarUrl }) => ({
    id,
    name,
    worldName,
    avatarUrl,
  }));

  return {
    userId,
    username: user.username,
    email: user.email,
    characters: userCharacters,
    selectedCharacter: userCharacters.find((character) => character.id === selectedCharacterId) ?? null,
  };
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieStore = await getRequestCookies();
  const session = await cookies.session.get(cookieStore);

  return session ? getCurrentUserForSession(session.userId, session.selectedCharacterId) : null;
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  return user;
}
