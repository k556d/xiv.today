import * as arctic from "arctic";
import { getAppUrl } from "@/server/app-url";
import { getRequiredEnv } from "@/server/get-required-env";

export const scopes = ["identify"] as const;

export function createOAuth() {
  return new arctic.Discord(
    getRequiredEnv("DISCORD_CLIENT_ID"),
    getRequiredEnv("DISCORD_CLIENT_SECRET"),
    getAppUrl("/api/oauth/discord/callback").toString(),
  );
}

export async function fetchProfile(accessToken: string): Promise<{
  providerAccountId: string;
  displayName: string;
  avatarUrl: string;
}> {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Discord user");
  }

  const profile = await response.json() as {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
  };

  return {
    providerAccountId: profile.id,
    displayName: profile.global_name ?? profile.username,
    avatarUrl: profile.avatar
      ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(profile.id) % BigInt(5))}.png`,
  };
}
