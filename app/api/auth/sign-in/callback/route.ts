import { type NextRequest } from "next/server";
import { cookies } from "@/server/cookie-definitions";
import { requireOAuthUser } from "@/server/linked-auth";
import { redirectToAuth, redirectToReturnTo } from "@/server/oauth/callback";
import { verifyOAuthResult } from "@/server/oauth/result";

export async function GET(request: NextRequest) {
  const resultToken = request.nextUrl.searchParams.get("result");
  const flow = await cookies.authFlow.get(request.cookies);

  if (flow.intent !== "sign-in" || !resultToken) {
    return redirectToAuth(flow.returnTo, "oauth-expired");
  }

  const result = await verifyOAuthResult(resultToken);
  if (result.nonce !== flow.nonce) {
    return redirectToAuth(flow.returnTo, "oauth-expired");
  }

  if (result.type === "error") {
    return redirectToAuth(flow.returnTo, result.error);
  }

  const userId = await requireOAuthUser(result);
  const response = redirectToReturnTo(flow.returnTo);
  await cookies.session.set(response.cookies, { userId, selectedCharacterId: null });
  return response;
}
