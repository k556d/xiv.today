import * as arctic from "arctic";

export const discordScopes = ["identify"] as const;

export function createDiscordOAuth(redirectURI: string) {
  return new arctic.Discord(
    process.env.DISCORD_CLIENT_ID,
    process.env.DISCORD_CLIENT_SECRET,
    redirectURI,
  );
}

export async function fetchDiscordUserId(accessToken: string) {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Discord user");
  }

  const profile = await response.json() as { id: string };
  return profile.id;
}
