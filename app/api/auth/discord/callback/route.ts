import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSession,
  oauthReturnToCookieName,
  oauthStateCookieName,
  resolveDiscordUserId,
  sessionCookieName,
} from "@/server/auth";
import { createDiscordOAuth, fetchDiscordUserId } from "@/server/oauth";

function cookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

function clearCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const storedState = cookieStore.get(oauthStateCookieName)?.value;
  const returnTo = cookieStore.get(oauthReturnToCookieName)?.value ?? "/";

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.json({ error: "Invalid OAuth callback." }, { status: 400 });
  }

  const discord = createDiscordOAuth(new URL("/api/auth/discord/callback", request.url).toString());
  const tokens = await discord.validateAuthorizationCode(code, null);
  const discordUserId = await fetchDiscordUserId(tokens.accessToken());
  const userId = await resolveDiscordUserId(discordUserId);
  const session = await createSession(userId);

  const response = NextResponse.redirect(new URL(returnTo, request.url));
  response.cookies.set(sessionCookieName, session.token, cookieOptions(session.expiresAt));
  response.cookies.set(oauthStateCookieName, "", clearCookieOptions());
  response.cookies.set(oauthReturnToCookieName, "", clearCookieOptions());

  return response;
}
