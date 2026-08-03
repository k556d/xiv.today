import { type OAuthResult, signOAuthResult } from "@/server/oauth/result";

export async function getOAuthResultUrl(callbackUrl: string, result: OAuthResult) {
  const url = new URL(callbackUrl);
  url.searchParams.set("result", await signOAuthResult(result));
  return url;
}
