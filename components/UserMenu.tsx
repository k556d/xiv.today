"use client";

import { useState } from "react";
import LoginModal from "./LoginModal";
import { useAuth } from "./AuthProvider";
import styles from "./UserMenu.module.css";

export default function UserMenu() {
  const { session, status, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (status === "loading") {
    return (
      <div className={styles.loading} />
    );
  }

  if (!session?.userId) {
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
      <div className={styles.statusBadge}>
        <svg
          className={styles.statusIcon}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20 21a8 8 0 1 0-16 0"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
        <span>Logged in</span>
      </div>
      <button
        onClick={() => {
          void signOut();
        }}
        className={styles.signOutButton}
      >
        Sign out
      </button>
    </div>
  );
}
