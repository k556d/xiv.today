import { z } from "zod";
import { cookies } from "@/server/cookie-definitions";
import { findLinkedUser, linkOAuthAccount } from "@/server/linked-auth";
import { getLinkErrorUrl, getReturnToUrl } from "@/server/oauth/callback";
import { verifyOAuthResult } from "@/server/oauth/result";
import { defineRoute } from "@xiv-today/next-request/route";

const linkCallbackDefinition = defineRoute({
  query: z.object({
    result: z.string(),
  }),
  cookies: {
    authFlow: { cookie: cookies.authFlow, access: "read-write" },
    session: { cookie: cookies.session, access: "read-write", optional: true },
  },
});

export const GET = linkCallbackDefinition.handle(async ({ query, cookies, redirect }) => {
  const flow = cookies.authFlow.value;
  const session = cookies.session.value;
  const resultToken = query.result;
  cookies.authFlow.clear();

  if (flow.intent !== "link" || !session || session.userId !== flow.userId) {
    return redirect(getLinkErrorUrl(flow.returnTo, "oauth-expired"));
  }

  const result = await verifyOAuthResult(resultToken);
  if (result.nonce !== flow.nonce) {
    return redirect(getLinkErrorUrl(flow.returnTo, "oauth-expired"));
  }

  if (result.type === "error") {
    if (result.error === "oauth-cancelled") {
      return redirect(getLinkErrorUrl(flow.returnTo, "oauth-cancelled"));
    }

    return redirect(getLinkErrorUrl(flow.returnTo, "oauth-expired"));
  }

  const linkedUserId = await findLinkedUser(result.provider, result.providerAccountId);
  if (linkedUserId && linkedUserId !== session.userId) {
    return redirect(getLinkErrorUrl(flow.returnTo, "oauth-account-linked"));
  }

  await linkOAuthAccount({ userId: session.userId, ...result });
  cookies.session.set(session);
  return redirect(getReturnToUrl(flow.returnTo));
});
