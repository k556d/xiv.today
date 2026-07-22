import { type NextRequest } from "next/server";
import { cookies } from "@/server/cookie-definitions";
import { createOAuth, fetchProfile } from "@/server/oauth/google";
import { redirectWithOAuthResult } from "@/server/oauth/redirect";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const {
    callbackUrl,
    codeVerifier,
    nonce,
    state: storedState,
  } = await cookies.oauth.get(request.cookies);

  if (request.nextUrl.searchParams.has("error")) {
    return redirectWithOAuthResult(callbackUrl, { type: "error", nonce, error: "oauth-cancelled" });
  }

  if (!code || !state || !codeVerifier || state !== storedState) {
    return redirectWithOAuthResult(callbackUrl, { type: "error", nonce, error: "oauth-expired" });
  }

  const google = createOAuth();
  const tokens = await google.validateAuthorizationCode(code, codeVerifier);
  const profile = await fetchProfile(tokens.accessToken());
  return redirectWithOAuthResult(callbackUrl, { type: "success", nonce, provider: "google", ...profile });
}
