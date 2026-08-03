"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { selectCharacter } from "@/app/actions/auth/select-character";
import { signOut } from "@/app/actions/auth/sign-out";
import type { CurrentUser } from "@/server/current-user";
import LoginModal from "./LoginModal";
import styles from "./UserMenu.module.css";

export default function UserMenuClient({ user }: { user: CurrentUser | null }) {
  const [loginOpen, setLoginOpen] = useState(false);

  if (!user) {
    return (
      <div className={styles.guestActions}>
        <button
          type="button"
          className={styles.signInButton}
          onClick={() => setLoginOpen(true)}
        >
          Sign in
        </button>
        {loginOpen ? <LoginModal onClose={() => setLoginOpen(false)} /> : null}
      </div>
    );
  }

  return (
    <div className={styles.userMenu}>
      {user.selectedCharacter ? (
        <div className={styles.characterBadge}>
          <Image className={styles.avatar} src={user.selectedCharacter.avatarUrl} alt="" width={20} height={20} unoptimized />
          <span className={styles.characterName}>{user.selectedCharacter.name}</span>
        </div>
      ) : (
        <span className={styles.noCharacter}>No character selected</span>
      )}
      <select
        className={styles.characterSelector}
        aria-label="Selected character"
        value={user.selectedCharacter?.id ?? ""}
        onChange={(event) => {
          void selectCharacter({ characterId: event.target.value || null });
        }}
      >
        <option value="">No character selected</option>
        {user.characters.map((character) => (
          <option key={character.id} value={character.id}>
            {character.name} ({character.worldName})
          </option>
        ))}
      </select>
      <Link href="/characters/select" className={styles.connectButton}>
        Add character
      </Link>
      <Link href="/settings/login-methods" className={styles.loginMethodsLink}>
        Account
      </Link>
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
