import { NextResponse } from "next/server";
import { getAppUrl } from "@/server/app-url";
import { cookies } from "@/server/cookie-definitions";

export function redirectToReturnTo(returnTo: string) {
  const url = getAppUrl(returnTo);

  const response = NextResponse.redirect(url);
  cookies.authFlow.clear(response.cookies);
  return response;
}

export function redirectToAuth(returnTo: string, error: string) {
  const url = getAppUrl("/auth");
  url.searchParams.set("oauthError", error);
  url.searchParams.set("returnTo", returnTo);

  const response = NextResponse.redirect(url);
  cookies.authFlow.clear(response.cookies);
  return response;
}

export function redirectToLinkError(returnTo: string, error: string) {
  const url = getAppUrl(returnTo);
  url.searchParams.set("oauthError", error);

  const response = NextResponse.redirect(url);
  cookies.authFlow.clear(response.cookies);
  return response;
}
