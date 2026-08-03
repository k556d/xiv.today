import { getRequiredEnv } from "@/server/get-required-env";

export function getAppOrigin() {
  return new URL(`https://${getRequiredEnv("VERCEL_URL")}`);
}

export function getAppUrl(pathname: string) {
  return new URL(pathname, getAppOrigin());
}

export function normalizeReturnTo(returnTo: string | null) {
  if (!returnTo) {
    return "/";
  }

  try {
    const origin = getAppOrigin();
    const url = new URL(returnTo, origin);

    if (url.origin !== origin.origin) {
      return "/";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
