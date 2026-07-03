import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUserId, sessionCookieName } from "@/server/auth";

function clearCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  };
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return NextResponse.json({ userId: null });
  }

  const userId = await getSessionUserId(token);
  const response = NextResponse.json({ userId });

  if (!userId) {
    response.cookies.set(sessionCookieName, "", clearCookieOptions());
  }

  return response;
}
