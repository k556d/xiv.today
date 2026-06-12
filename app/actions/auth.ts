"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

export async function register(formData: FormData): Promise<RegisterResult> {
  const username = formData.get("username") as string | null;
  const password = formData.get("password") as string | null;

  if (!username || !password) {
    return { success: false, error: "Username and password are required." };
  }

  const trimmed = username.trim();
  if (trimmed.length < 2) {
    return {
      success: false,
      error: "Username must be at least 2 characters.",
    };
  }
  if (trimmed.length > 32) {
    return { success: false, error: "Username must be 32 characters or less." };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters.",
    };
  }

  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.name, trimmed))
      .limit(1);

    if (existing) {
      return { success: false, error: "Username is already taken." };
    }

    const hash = await bcrypt.hash(password, 10);
    await db.insert(users).values({ name: trimmed, password: hash });

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Registration is temporarily unavailable. Please try again later.",
    };
  }
}
