import { NextResponse } from "next/server";
import {
  discordScopes,
  createDiscordOAuth,
} from "@/server/oauth";
import {
  oauthReturnToCookieName,
  oauthStateCookieName,
} from "@/server/auth";
import * as arctic from "arctic";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  };
}

function normalizeReturnTo(returnTo: string | null, requestUrl: string) {
  if (!returnTo) {
    return "/";
  }

  try {
    const parsed = new URL(returnTo, requestUrl);
    const origin = new URL(requestUrl).origin;

    if (parsed.origin !== origin) {
      return "/";
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = normalizeReturnTo(url.searchParams.get("returnTo"), request.url);
  const state = arctic.generateState();
  const discord = createDiscordOAuth(new URL("/api/auth/discord/callback", request.url).toString());
  const authorizationURL = discord.createAuthorizationURL(state, null, [...discordScopes]);

  const response = NextResponse.redirect(String(authorizationURL));
  response.cookies.set(oauthStateCookieName, state, cookieOptions());
  response.cookies.set(oauthReturnToCookieName, returnTo, cookieOptions());
  return response;
}
