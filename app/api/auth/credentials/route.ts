import { NextResponse } from "next/server";
import {
  createSession,
  findUserByUsername,
  sessionCookieName,
  verifyPassword,
} from "@/server/auth";

function cookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Missing credentials." }, { status: 400 });
  }

  const trimmed = username.trim();
  if (!trimmed || !password) {
    return NextResponse.json({ error: "Missing credentials." }, { status: 400 });
  }

  const user = await findUserByUsername(trimmed);
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const session = await createSession(user.id);
  const response = NextResponse.json({ userId: user.id });
  response.cookies.set(sessionCookieName, session.token, cookieOptions(session.expiresAt));
  return response;
}
