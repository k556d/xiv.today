import * as arctic from "arctic";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "@/server/cookie-definitions";
import { createOAuth, scopes } from "@/server/oauth/discord";
import { oauthRequestSchema } from "@/server/oauth/request";
import { respondJson } from "@/server/respond-json";

const responses = {
  invalidRequest: { body: { error: "Invalid OAuth request." }, status: 400 },
} as const;

export async function GET(request: NextRequest) {
  const oauthRequest = oauthRequestSchema.safeParse({
    callbackUrl: request.nextUrl.searchParams.get("callbackUrl"),
    nonce: request.nextUrl.searchParams.get("nonce"),
  });

  if (!oauthRequest.success) {
    return respondJson(responses.invalidRequest);
  }

  const state = arctic.generateState();
  const discord = createOAuth();
  const authorizationUrl = discord.createAuthorizationURL(state, null, [...scopes]);
  const response = NextResponse.redirect(String(authorizationUrl));
  await cookies.oauth.set(response.cookies, { state, ...oauthRequest.data });
  return response;
}
