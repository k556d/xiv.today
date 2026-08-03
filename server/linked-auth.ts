import {
  createLinkedUser,
  findLinkedUserId,
  replaceLinkedAccount,
  type LinkedAccountInput,
} from "@/server/db/linked-accounts";

export async function findLinkedUser(provider: string, providerAccountId: string) {
  return findLinkedUserId(provider, providerAccountId);
}

export async function requireOAuthUser(account: LinkedAccountInput): Promise<string> {
  const { provider, providerAccountId } = account;
  const linkedUserId = await findLinkedUser(provider, providerAccountId);

  if (linkedUserId) {
    return linkedUserId;
  }

  const userId = crypto.randomUUID();

  await createLinkedUser(userId, account);

  return userId;
}

export async function linkOAuthAccount({
  userId,
  ...account
}: LinkedAccountInput & {
  userId: string;
}): Promise<void> {
  await replaceLinkedAccount(userId, account);
}
