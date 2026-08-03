import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "@/server/cookie-definitions";
import { createOAuth, scopes } from "@/server/oauth/google";
import { oauthRequestSchema } from "@/server/oauth/request";
import { defineRoute } from "@/server/route";

const googleOAuthStartDefinition = defineRoute({
  query: oauthRequestSchema,
  cookies: {
    oauth: { cookie: cookies.oauth, access: "write" },
  },
});

export const GET = googleOAuthStartDefinition.handle(({ query, cookies, redirect }) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const google = createOAuth();
  const authorizationUrl = google.createAuthorizationURL(state, codeVerifier, [...scopes]);
  cookies.oauth.set({ state, codeVerifier, ...query });
  return redirect(authorizationUrl);
});
