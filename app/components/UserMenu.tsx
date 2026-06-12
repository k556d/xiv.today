"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import LoginModal from "./LoginModal";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [showLogin, setShowLogin] = useState(false);

  if (status === "loading") {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
    );
  }

  if (!session?.user) {
    return (
      <>
        <button
          onClick={() => setShowLogin(true)}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-200/10 focus:outline-none focus:ring-2 focus:ring-cyan-200"
        >
          Sign in
        </button>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </>
    );
  }

  return (
    <div className="relative flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-indigo-600 text-sm font-bold text-white">
        {session.user.name?.charAt(0)?.toUpperCase() ?? "?"}
      </div>
      <button
        onClick={() => signOut()}
        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-red-400/50 hover:bg-red-400/10 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400"
      >
        Sign out
      </button>
    </div>
  );
}
