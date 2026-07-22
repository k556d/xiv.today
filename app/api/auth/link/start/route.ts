import { type NextRequest } from "next/server";
import { cookies } from "@/server/cookie-definitions";
import { oauthProviderSchema, redirectToOAuthProvider } from "@/server/auth-oauth";
import { respondJson } from "@/server/respond-json";

const responses = {
  invalidProvider: { body: { error: "Invalid OAuth provider." }, status: 400 },
  signInFirst: { body: { error: "Sign in first." }, status: 401 },
} as const;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const provider = oauthProviderSchema.safeParse(formData.get("provider"));
  const returnToValue = formData.get("returnTo");
  const session = await cookies.session.get(request.cookies, { allowMissing: true });

  if (!provider.success) {
    return respondJson(responses.invalidProvider);
  }

  if (!session) {
    return respondJson(responses.signInFirst);
  }

  const nonce = crypto.randomUUID();
  const response = redirectToOAuthProvider(provider.data, "/api/auth/link/callback", nonce);
  await cookies.authFlow.set(response.cookies, {
    intent: "link",
    nonce,
    returnTo: typeof returnToValue === "string" ? returnToValue : "/settings/login-methods",
    userId: session.userId,
  });
  return response;
}
