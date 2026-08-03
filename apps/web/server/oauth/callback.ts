import { getAppUrl } from "@/server/app-url";

export function getReturnToUrl(returnTo: string) {
  return getAppUrl(returnTo);
}

export function getAuthErrorUrl(returnTo: string, error: string) {
  const url = getAppUrl("/auth");
  url.searchParams.set("oauthError", error);
  url.searchParams.set("returnTo", returnTo);
  return url;
}

export function getLinkErrorUrl(returnTo: string, error: string) {
  const url = getAppUrl(returnTo);
  url.searchParams.set("oauthError", error);
  return url;
}
