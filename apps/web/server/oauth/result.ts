import { addMinutes } from "date-fns";
import { z } from "zod";
import { signJwt, verifyJwt } from "@/server/jwt";

const oauthResultSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("success"),
    nonce: z.string(),
    provider: z.enum(["discord", "google"]),
    providerAccountId: z.string(),
    displayName: z.string(),
    avatarUrl: z.string(),
  }),
  z.object({
    type: z.literal("error"),
    nonce: z.string(),
    error: z.enum(["oauth-cancelled", "oauth-expired"]),
  }),
]);

export type OAuthResult = z.output<typeof oauthResultSchema>;

export function signOAuthResult(result: OAuthResult) {
  return signJwt(
    {
      iss: "xiv.today-oauth-broker",
      aud: "xiv.today",
      jti: crypto.randomUUID(),
      result,
    },
    addMinutes(new Date(), 10),
  );
}

export async function verifyOAuthResult(token: string) {
  const payload = await verifyJwt(token);

  if (payload.iss !== "xiv.today-oauth-broker" || payload.aud !== "xiv.today") {
    throw new Error("Invalid OAuth result.");
  }

  return oauthResultSchema.parse(payload.result);
}
