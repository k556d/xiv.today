import { z } from "zod";
import { getOAuthProviderUrl, oauthProviderSchema } from "@/server/auth-oauth";
import { cookies } from "@/server/cookie-definitions";
import { defineRoute } from "@/server/route";

const linkStartDefinition = defineRoute({
  body: z.object({
    provider: oauthProviderSchema,
    returnTo: z.string().default("/settings/login-methods"),
  }),
  cookies: {
    session: { cookie: cookies.session, access: "read", optional: true },
    authFlow: { cookie: cookies.authFlow, access: "write" },
  },
  errors: {
    signInFirst: {
      status: 401,
      body: {
        error: {
          code: "sign-in-first",
          message: "Sign in first.",
        },
      },
    },
  },
});

export const POST = linkStartDefinition.handle(({ body, cookies, errors, redirect }) => {
  const session = cookies.session.value;

  if (!session) {
    throw errors.signInFirst();
  }

  const nonce = crypto.randomUUID();
  cookies.authFlow.set({
    intent: "link",
    nonce,
    returnTo: body.returnTo,
    userId: session.userId,
  });
  return redirect(getOAuthProviderUrl(
    body.provider,
    "/api/auth/link/callback",
    nonce,
  ), 303);
});
