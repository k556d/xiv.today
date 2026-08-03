import { z } from "zod";
import { cookies } from "@/server/cookie-definitions";
import { createOAuth, fetchProfile } from "@/server/oauth/discord";
import { getOAuthResultUrl } from "@/server/oauth/redirect";
import { defineRoute } from "@/server/route";

const discordOAuthCallbackDefinition = defineRoute({
  query: z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional(),
  }),
  cookies: {
    oauth: { cookie: cookies.oauth, access: "read-write" },
  },
});

export const GET = discordOAuthCallbackDefinition.handle(async ({ query, cookies, redirect }) => {
  const { callbackUrl, nonce, state: storedState } = cookies.oauth.value;
  const { code, error, state } = query;
  cookies.oauth.clear();

  if (error !== undefined) {
    return redirect(await getOAuthResultUrl(callbackUrl, {
      type: "error",
      nonce,
      error: "oauth-cancelled",
    }));
  }

  if (!code || !state || state !== storedState) {
    return redirect(await getOAuthResultUrl(callbackUrl, {
      type: "error",
      nonce,
      error: "oauth-expired",
    }));
  }

  const discord = createOAuth();
  const tokens = await discord.validateAuthorizationCode(code, null);
  const profile = await fetchProfile(tokens.accessToken());
  return redirect(await getOAuthResultUrl(callbackUrl, {
    type: "success",
    nonce,
    provider: "discord",
    ...profile,
  }));
});
