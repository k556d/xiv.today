import * as arctic from "arctic";
import { cookies } from "@/server/cookie-definitions";
import { createOAuth, scopes } from "@/server/oauth/discord";
import { oauthRequestSchema } from "@/server/oauth/request";
import { createRoute } from "@/server/route";

const discordOAuthStartDefinition = {
  query: oauthRequestSchema,
  cookies: {
    oauth: { cookie: cookies.oauth, access: "write" },
  },
} as const;

export const GET = createRoute(discordOAuthStartDefinition, async ({ query, cookies, redirect }) => {
  const state = arctic.generateState();
  const discord = createOAuth();
  const authorizationUrl = discord.createAuthorizationURL(state, null, [...scopes]);
  cookies.oauth.set({ state, ...query });
  return redirect(authorizationUrl);
});
