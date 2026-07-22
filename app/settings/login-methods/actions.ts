"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { createPasswordHash } from "@/server/auth";
import { requireUser } from "@/server/current-user";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

const credentialsSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_-]{2,32}$/).or(z.literal("")),
  password: z.string().or(z.literal("")),
});

export async function updateCredentials(usernameValue: string, passwordValue: string) {
  const user = await requireUser();
  const parsed = credentialsSchema.safeParse({ username: usernameValue, password: passwordValue });
  const username = usernameValue.trim().toLowerCase() || null;
  const password = passwordValue || null;

  if (!username && !password) {
    return { ok: false as const, error: "Enter a username or password to update." };
  }
  if (!parsed.success || (password && password.length < 8)) {
    return {
      ok: false as const,
      error: password && password.length < 8
        ? "Password must be at least 8 characters."
        : "Username must be 2-32 characters and use only letters, numbers, underscores, or hyphens.",
    };
  }

  if (username) {
    const [owner] = await db.select({ userId: users.id }).from(users).where(eq(users.username, username)).limit(1);
    if (owner && owner.userId !== user.userId) {
      return { ok: false as const, error: "Username is already taken." };
    }
  }

  const passwordHash = password ? await createPasswordHash(password) : undefined;
  await db.update(users).set({ ...(username ? { username } : {}), ...(passwordHash ? { passwordHash } : {}) }).where(eq(users.id, user.userId));
  return { ok: true as const, username };
}
