import * as arctic from "arctic";
import { cookies } from "@/server/cookie-definitions";
import { createOAuth, scopes } from "@/server/oauth/discord";
import { oauthRequestSchema } from "@/server/oauth/request";
import { defineRoute } from "@xiv-today/next-request/route";

const discordOAuthStartDefinition = defineRoute({
  query: oauthRequestSchema,
  cookies: {
    oauth: { cookie: cookies.oauth, access: "write" },
  },
});

export const GET = discordOAuthStartDefinition.handle(({ query, cookies, redirect }) => {
  const state = arctic.generateState();
  const discord = createOAuth();
  const authorizationUrl = discord.createAuthorizationURL(state, null, [...scopes]);
  cookies.oauth.set({ state, ...query });
  return redirect(authorizationUrl);
});
