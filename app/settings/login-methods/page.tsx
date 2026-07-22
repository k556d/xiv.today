import { unauthorized } from "next/navigation";
import { eq } from "drizzle-orm";
import LoginMethodsPanel from "@/components/LoginMethodsPanel";
import { getCurrentUser } from "@/server/current-user";
import { db } from "@/server/db";
import { linkedAccounts, users } from "@/server/db/schema";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function LoginMethodsPage({
  searchParams,
}: {
  searchParams: Promise<{ oauthError?: string | string[] }>;
}) {
  const session = await getCurrentUser();
  const { oauthError } = await searchParams;

  if (!session) {
    unauthorized();
  }

  const loginMethodRows = await db
    .select({
      username: users.username,
      email: users.email,
      provider: linkedAccounts.provider,
    })
    .from(users)
    .leftJoin(linkedAccounts, eq(linkedAccounts.userId, users.id))
    .where(eq(users.id, session.userId))

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <LoginMethodsPanel
          linkedProviders={loginMethodRows.flatMap((row) => (row.provider ? [row.provider] : []))}
          username={loginMethodRows[0]?.username ?? null}
          email={loginMethodRows[0]?.email ?? null}
          oauthError={typeof oauthError === "string" ? oauthError : null}
        />
      </div>
    </main>
  );
}
