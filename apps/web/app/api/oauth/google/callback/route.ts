import { z } from "zod";
import { cookies } from "@/server/cookie-definitions";
import { createOAuth, fetchProfile } from "@/server/oauth/google";
import { getOAuthResultUrl } from "@/server/oauth/redirect";
import { defineRoute } from "@xiv-today/next-request/route";

const googleOAuthCallbackDefinition = defineRoute({
  query: z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional(),
  }),
  cookies: {
    oauth: { cookie: cookies.oauth, access: "read-write" },
  },
});

export const GET = googleOAuthCallbackDefinition.handle(async ({ query, cookies, redirect }) => {
  const { callbackUrl, codeVerifier, nonce, state: storedState } = cookies.oauth.value;
  const { code, error, state } = query;
  cookies.oauth.clear();

  if (error !== undefined) {
    return redirect(await getOAuthResultUrl(callbackUrl, {
      type: "error",
      nonce,
      error: "oauth-cancelled",
    }));
  }

  if (!code || !state || !codeVerifier || state !== storedState) {
    return redirect(await getOAuthResultUrl(callbackUrl, {
      type: "error",
      nonce,
      error: "oauth-expired",
    }));
  }

  const google = createOAuth();
  const tokens = await google.validateAuthorizationCode(code, codeVerifier);
  const profile = await fetchProfile(tokens.accessToken());
  return redirect(await getOAuthResultUrl(callbackUrl, {
    type: "success",
    nonce,
    provider: "google",
    ...profile,
  }));
});
