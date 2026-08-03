import { and, eq } from "drizzle-orm";
import { db } from "./index";
import { linkedAccounts, users } from "./schema";

export type LinkedAccountInput = {
  provider: string;
  providerAccountId: string;
  displayName: string;
  avatarUrl: string;
};

export async function findLinkedUserId(provider: string, providerAccountId: string): Promise<string | null> {
  const [linkedUser] = await db
    .select({ userId: linkedAccounts.userId })
    .from(linkedAccounts)
    .where(and(eq(linkedAccounts.provider, provider), eq(linkedAccounts.providerAccountId, providerAccountId)))
    .limit(1);

  return linkedUser?.userId ?? null;
}

export async function createLinkedUser(userId: string, account: LinkedAccountInput): Promise<void> {
  await db.batch([
    db.insert(users).values({ id: userId }),
    db.insert(linkedAccounts).values({ userId, ...account }),
  ]);
}

export async function replaceLinkedAccount(userId: string, account: LinkedAccountInput): Promise<void> {
  await db.batch([
    db.delete(linkedAccounts).where(and(
      eq(linkedAccounts.userId, userId),
      eq(linkedAccounts.provider, account.provider),
    )),
    db.insert(linkedAccounts).values({ userId, ...account }),
  ]);
}
