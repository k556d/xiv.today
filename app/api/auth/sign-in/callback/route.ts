import { z } from "zod";
import { cookies } from "@/server/cookie-definitions";
import { requireOAuthUser } from "@/server/linked-auth";
import { getAuthErrorUrl, getReturnToUrl } from "@/server/oauth/callback";
import { verifyOAuthResult } from "@/server/oauth/result";
import { defineRoute } from "@/server/route";

const signInCallbackDefinition = defineRoute({
  query: z.object({
    result: z.string(),
  }),
  cookies: {
    authFlow: { cookie: cookies.authFlow, access: "read-write" },
    session: { cookie: cookies.session, access: "write" },
  },
});

export const GET = signInCallbackDefinition.handle(async ({ query, cookies, redirect }) => {
  const flow = cookies.authFlow.value;
  const resultToken = query.result;
  cookies.authFlow.clear();

  if (flow.intent !== "sign-in") {
    return redirect(getAuthErrorUrl(flow.returnTo, "oauth-expired"));
  }

  const result = await verifyOAuthResult(resultToken);
  if (result.nonce !== flow.nonce) {
    return redirect(getAuthErrorUrl(flow.returnTo, "oauth-expired"));
  }

  if (result.type === "error") {
    if (result.error === "oauth-cancelled") {
      return redirect(getAuthErrorUrl(flow.returnTo, "oauth-cancelled"));
    }

    return redirect(getAuthErrorUrl(flow.returnTo, "oauth-expired"));
  }

  const userId = await requireOAuthUser(result);
  cookies.session.set({ userId, selectedCharacterId: null });
  return redirect(getReturnToUrl(flow.returnTo));
});
