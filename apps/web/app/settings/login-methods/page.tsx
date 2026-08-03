import { unauthorized } from "next/navigation";
import LoginMethodsPanel from "@/components/LoginMethodsPanel";
import { getCurrentUser } from "@/server/current-user";
import { findLoginMethodFields } from "@/server/db/users";
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

  const loginMethodRows = await findLoginMethodFields(session.userId);

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
