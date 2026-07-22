import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { linkedAccounts, users } from "@/server/db/schema";

export async function findLinkedUser(provider: string, providerAccountId: string) {
  const [linkedUser] = await db
    .select({ userId: linkedAccounts.userId })
    .from(linkedAccounts)
    .where(and(eq(linkedAccounts.provider, provider), eq(linkedAccounts.providerAccountId, providerAccountId)))
    .limit(1);

  return linkedUser?.userId;
}

export async function requireOAuthUser({
  provider,
  providerAccountId,
  displayName,
  avatarUrl,
}: {
  provider: string;
  providerAccountId: string;
  displayName: string;
  avatarUrl: string;
}): Promise<string> {
  const linkedUserId = await findLinkedUser(provider, providerAccountId);

  if (linkedUserId) {
    return linkedUserId;
  }

  const userId = crypto.randomUUID();

  await db.batch([
    db.insert(users).values({ id: userId }),
    db.insert(linkedAccounts).values({
      userId,
      provider,
      providerAccountId,
      displayName,
      avatarUrl,
    }),
  ]);

  return userId;
}

export async function linkOAuthAccount({
  userId,
  provider,
  providerAccountId,
  displayName,
  avatarUrl,
}: {
  userId: string;
  provider: string;
  providerAccountId: string;
  displayName: string;
  avatarUrl: string;
}): Promise<void> {
  await db.batch([
    db.delete(linkedAccounts)
      .where(and(eq(linkedAccounts.userId, userId), eq(linkedAccounts.provider, provider))),
    db.insert(linkedAccounts).values({
      userId,
      provider,
      providerAccountId,
      displayName,
      avatarUrl,
    }),
  ]);
}
