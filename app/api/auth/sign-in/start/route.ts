import { z } from "zod";
import { getOAuthProviderUrl, oauthProviderSchema } from "@/server/auth-oauth";
import { cookies } from "@/server/cookie-definitions";
import { createRouteHandler } from "@/server/route-handler";

const signInStartDefinition = {
  body: z.object({
    provider: oauthProviderSchema,
    returnTo: z.string().default("/"),
  }),
  cookies: {
    authFlow: { cookie: cookies.authFlow, access: "write" },
  },
} as const;

export const POST = createRouteHandler(signInStartDefinition, async ({ body, cookies, redirect }) => {
  const nonce = crypto.randomUUID();
  cookies.authFlow.set({
    intent: "sign-in",
    nonce,
    returnTo: body.returnTo,
  });
  return redirect(getOAuthProviderUrl(
    body.provider,
    "/api/auth/sign-in/callback",
    nonce,
  ), 303);
});
