import { type NextRequest, NextResponse } from "next/server";
import { getAppOrigin } from "@/server/app-url";
import { respondJson } from "@/server/respond-json";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function proxy(request: NextRequest) {
  if (unsafeMethods.has(request.method) && request.headers.get("origin") !== getAppOrigin().origin) {
    return respondJson({ body: { error: "Invalid request origin." }, status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
