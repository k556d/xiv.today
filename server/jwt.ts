import { jwtVerify, SignJWT } from "jose";
import { getRequiredEnv } from "@/server/get-required-env";

function getJwtSecret() {
  return new TextEncoder().encode(getRequiredEnv("JWT_SECRET"));
}

export function signJwt(payload: Record<string, unknown>, expiresAt?: Date) {
  const jwt = new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" });

  if (expiresAt) {
    jwt.setExpirationTime(expiresAt);
  }

  return jwt.sign(getJwtSecret());
}

export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ["HS256"] });
  return payload;
}
