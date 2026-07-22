import { NextResponse } from "next/server";
import { cookies } from "@/server/cookie-definitions";
import { type OAuthResult, signOAuthResult } from "@/server/oauth/result";

export async function redirectWithOAuthResult(callbackUrl: string, result: OAuthResult) {
  const url = new URL(callbackUrl);
  url.searchParams.set("result", await signOAuthResult(result));

  const response = NextResponse.redirect(url);
  cookies.oauth.clear(response.cookies);
  return response;
}
