import { type NextRequest } from "next/server";
import { cookies } from "@/server/cookie-definitions";
import { findLinkedUser, linkOAuthAccount } from "@/server/linked-auth";
import { redirectToLinkError, redirectToReturnTo } from "@/server/oauth/callback";
import { verifyOAuthResult } from "@/server/oauth/result";

export async function GET(request: NextRequest) {
  const resultToken = request.nextUrl.searchParams.get("result");
  const flow = await cookies.authFlow.get(request.cookies);
  const session = await cookies.session.get(request.cookies, { allowMissing: true });

  if (flow.intent !== "link" || !resultToken || !session || session.userId !== flow.userId) {
    return redirectToLinkError(flow.returnTo, "oauth-expired");
  }

  const result = await verifyOAuthResult(resultToken);
  if (result.nonce !== flow.nonce) {
    return redirectToLinkError(flow.returnTo, "oauth-expired");
  }

  if (result.type === "error") {
    return redirectToLinkError(flow.returnTo, result.error);
  }

  const linkedUserId = await findLinkedUser(result.provider, result.providerAccountId);
  if (linkedUserId && linkedUserId !== session.userId) {
    return redirectToLinkError(flow.returnTo, "oauth-account-linked");
  }

  await linkOAuthAccount({ userId: session.userId, ...result });
  const response = redirectToReturnTo(flow.returnTo);
  await cookies.session.set(response.cookies, session);
  return response;
}
