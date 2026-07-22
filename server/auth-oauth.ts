import { NextResponse } from "next/server";
import { z } from "zod";
import { getAppUrl } from "@/server/app-url";

export const oauthProviderSchema = z.enum(["discord", "google"]);

export function redirectToOAuthProvider(provider: z.output<typeof oauthProviderSchema>, callbackPath: string, nonce: string) {
  const url = getAppUrl(`/api/oauth/${provider}/start`);
  url.searchParams.set("callbackUrl", getAppUrl(callbackPath).toString());
  url.searchParams.set("nonce", nonce);
  return NextResponse.redirect(url, 303);
}
