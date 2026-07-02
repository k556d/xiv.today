import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/server/db";
import { authAccounts, users } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

type OAuthAccount = {
  provider: string;
  providerAccountId: string;
};

async function getUserById(userId: string) {
  const [user] = await db
    .select({ id: users.id, username: users.username, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

async function syncOAuthAccount({
  account,
  currentUserId,
}: {
  account: OAuthAccount;
  currentUserId?: string;
}) {
  const [linkedAccount] = await db
    .select({ userId: authAccounts.userId })
    .from(authAccounts)
    .where(
      and(
        eq(authAccounts.provider, account.provider),
        eq(authAccounts.providerAccountId, account.providerAccountId),
      ),
    )
    .limit(1);

  if (linkedAccount) {
    return getUserById(linkedAccount.userId);
  }

  let userId = currentUserId;

  if (userId) {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      userId = undefined;
    }
  }

  if (!userId) {
    const [createdUser] = await db
      .insert(users)
      .values({ username: null })
      .returning({ id: users.id, username: users.username, email: users.email });

    userId = createdUser.id;
  }

  const resolvedUserId = userId as string;

  await db.insert(authAccounts).values({
    userId: resolvedUserId,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
  });

  return getUserById(resolvedUserId);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      authorization: { params: { scope: "identify" } },
    }),
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials.username as string | undefined;
        const password = credentials.password as string | undefined;
        if (!username || !password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.username, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      const authToken = token as typeof token & {
        userId?: string;
        username?: string | null;
        email?: string | null;
      };

      if (user) {
        authToken.userId = user.id;
        authToken.username = user.name ?? null;
        authToken.email = user.email ?? null;
      }

      if (account?.provider && account.provider !== "credentials" && profile) {
        const syncedUser = await syncOAuthAccount({
          account,
          currentUserId: typeof authToken.userId === "string" ? authToken.userId : undefined,
        });

        if (syncedUser) {
          authToken.userId = syncedUser.id;
          authToken.username = syncedUser.username ?? null;
          authToken.email = syncedUser.email ?? null;
        }
      }

      return authToken;
    },
    async session({ session, token }) {
      const authToken = token as typeof token & {
        userId?: string;
        username?: string | null;
        email?: string | null;
      };

      if (session.user) {
        session.user.id = typeof authToken.userId === "string" ? authToken.userId : session.user.id;
        session.user.username = typeof authToken.username === "string" ? authToken.username : null;
        session.user.name = session.user.username ?? session.user.name ?? null;
        session.user.email = typeof authToken.email === "string" ? authToken.email : session.user.email;
      }

      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
