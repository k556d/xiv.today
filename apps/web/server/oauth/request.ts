import { z } from "zod";
import { getAppOrigin } from "@/server/app-url";

const callbackPaths = new Set([
  "/api/auth/link/callback",
  "/api/auth/sign-in/callback",
]);

const callbackUrlSchema = z.string().url().transform((value, context) => {
  const url = new URL(value);

  if (
    url.origin !== getAppOrigin().origin
    || !callbackPaths.has(url.pathname)
    || url.search
    || url.hash
  ) {
    context.addIssue({ code: "custom", message: "Invalid OAuth callback URL." });
    return z.NEVER;
  }

  return url.toString();
});

export const oauthRequestSchema = z.object({
  callbackUrl: callbackUrlSchema,
  nonce: z.string().min(1),
});
