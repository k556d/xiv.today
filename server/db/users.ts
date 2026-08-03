import { eq, or } from "drizzle-orm";
import { db } from "./index";
import { linkedAccounts, users } from "./schema";

export async function findUserByIdentifier(identifier: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(or(eq(users.username, identifier), eq(users.email, identifier)))
    .limit(1);

  return user ?? null;
}

export async function findUserIdByUsername(username: string) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return user?.id ?? null;
}

export async function findUserIdByEmail(email: string) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user?.id ?? null;
}

export async function findUserById(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

export function findLoginMethodFields(userId: string) {
  return db
    .select({
      username: users.username,
      email: users.email,
      provider: linkedAccounts.provider,
    })
    .from(users)
    .leftJoin(linkedAccounts, eq(linkedAccounts.userId, users.id))
    .where(eq(users.id, userId));
}

export async function createPasswordUser(username: string, passwordHash: string) {
  const [user] = await db
    .insert(users)
    .values({ username, passwordHash })
    .returning();

  return user;
}

export async function createEmailUser(email: string) {
  const [user] = await db
    .insert(users)
    .values({ email })
    .returning();

  return user ?? null;
}

export async function updateUserEmail(userId: string, email: string): Promise<void> {
  await db.update(users).set({ email }).where(eq(users.id, userId));
}

export async function updateUserCredentials(
  userId: string,
  credentials: { username?: string; passwordHash?: string },
): Promise<void> {
  await db.update(users).set(credentials).where(eq(users.id, userId));
}
