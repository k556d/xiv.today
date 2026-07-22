import AuthPageClient from "./AuthPageClient";
import { normalizeReturnTo } from "@/server/app-url";

const oauthErrors = {
  "oauth-account-linked": "This account is already linked to another user.",
  "oauth-cancelled": "OAuth sign-in was cancelled.",
  "oauth-expired": "Your OAuth sign-in expired. Please try again.",
} as const;

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{
    oauthError?: string | string[];
    returnTo?: string | string[];
  }>;
}) {
  const { oauthError, returnTo } = await searchParams;
  const error = typeof oauthError === "string" && oauthError in oauthErrors
    ? oauthErrors[oauthError as keyof typeof oauthErrors]
    : "";
  const destination = normalizeReturnTo(typeof returnTo === "string" ? returnTo : null);

  return <AuthPageClient error={error} returnTo={destination} />;
}
