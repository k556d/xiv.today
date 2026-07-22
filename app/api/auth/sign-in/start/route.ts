import { type NextRequest } from "next/server";
import { cookies } from "@/server/cookie-definitions";
import { oauthProviderSchema, redirectToOAuthProvider } from "@/server/auth-oauth";
import { respondJson } from "@/server/respond-json";

const responses = {
  invalidProvider: { body: { error: "Invalid OAuth provider." }, status: 400 },
} as const;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const provider = oauthProviderSchema.safeParse(formData.get("provider"));
  const returnToValue = formData.get("returnTo");

  if (!provider.success) {
    return respondJson(responses.invalidProvider);
  }

  const nonce = crypto.randomUUID();
  const response = redirectToOAuthProvider(provider.data, "/api/auth/sign-in/callback", nonce);
  await cookies.authFlow.set(response.cookies, {
    intent: "sign-in",
    nonce,
    returnTo: typeof returnToValue === "string" ? returnToValue : "/",
  });
  return response;
}
