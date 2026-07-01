"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import LoginModal from "./LoginModal";
import styles from "./UserMenu.module.css";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [showLogin, setShowLogin] = useState(false);

  if (status === "loading") {
    return (
      <div className={styles.loading} />
    );
  }

  if (!session?.user) {
      return (
      <>
        <button
          onClick={() => setShowLogin(true)}
          className={styles.signInButton}
        >
          Sign in
        </button>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </>
    );
  }

  return (
    <div className={styles.userMenu}>
      <div className={styles.avatar}>
        {session.user.name?.charAt(0)?.toUpperCase() ?? "?"}
      </div>
      <button
        onClick={() => signOut()}
        className={styles.signOutButton}
      >
        Sign out
      </button>
    </div>
  );
}
