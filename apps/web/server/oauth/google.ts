import * as arctic from "arctic";
import { getRequiredEnv } from "@/server/get-required-env";
import { getAppUrl } from "@/server/app-url";

export const scopes = ["openid", "profile"] as const;

export function createOAuth() {
  return new arctic.Google(
    getRequiredEnv("GOOGLE_CLIENT_ID"),
    getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    getAppUrl("/api/oauth/google/callback").toString(),
  );
}

export async function fetchProfile(accessToken: string): Promise<{
  providerAccountId: string;
  displayName: string;
  avatarUrl: string;
}> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Google user");
  }

  const profile = await response.json() as {
    id: string;
    name: string | null;
    picture: string | null;
  };

  return {
    providerAccountId: profile.id,
    displayName: profile.name ?? profile.id,
    avatarUrl: profile.picture ?? "",
  };
}
