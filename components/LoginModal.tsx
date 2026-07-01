"use client";

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { register } from "@/server/actions/auth";
import styles from "./LoginModal.module.css";

type Mode = "choose" | "login" | "register";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("choose");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCredentialsSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      const form = new FormData(e.currentTarget);
      const username = form.get("username") as string;
      const password = form.get("password") as string;

      try {
        if (mode === "register") {
          const result = await register(form);
          if (!result.success) {
            setError(result.error);
            setLoading(false);
            return;
          }
        }

        const res = await signIn("credentials", {
          username,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError(
            mode === "register"
              ? "Account created but login failed. Try signing in."
              : "Invalid username or password.",
          );
          if (mode === "register") setMode("login");
        } else {
          onClose();
          window.location.reload();
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [mode, onClose],
  );

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        <h2 className={styles.title}>
          {mode === "choose" && "Sign in to xiv.today"}
          {mode === "login" && "Sign in with username"}
          {mode === "register" && "Create an account"}
        </h2>

        {mode === "choose" && (
          <div className={styles.choiceStack}>
            <button
              onClick={() => setMode("login")}
              className={styles.choiceButton}
            >
              <UserIcon />
              Continue with username
            </button>
            <button
              onClick={() => signIn("discord")}
              className={`${styles.choiceButton} ${styles.choiceButtonDiscord}`}
            >
              <DiscordIcon />
              Continue with Discord
            </button>
          </div>
        )}

        {(mode === "login" || mode === "register") && (
          <form onSubmit={handleCredentialsSubmit} className={styles.form}>
            <div>
              <label
                htmlFor="username"
                className={styles.label}
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                minLength={2}
                maxLength={32}
                autoComplete="username"
                className={styles.input}
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className={styles.label}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                className={styles.input}
                placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"}
              />
            </div>

            {error && (
              <p className={styles.error}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading
                ? "Please wait…"
                : mode === "register"
                  ? "Create account"
                  : "Sign in"}
            </button>

            <p className={styles.helpText}>
              {mode === "login" ? (
                <>
                  No account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError("");
                    }}
                    className={styles.helpButton}
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                    className={styles.helpButton}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

            <button
              type="button"
              onClick={() => {
                setMode("choose");
                setError("");
              }}
              className={styles.backButton}
            >
              ← Other sign-in options
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
    </svg>
  );
}
