"use client";

import { useState } from "react";
import { FaDiscord, FaGoogle } from "react-icons/fa6";
import { cancelEmailChallenge } from "@/app/actions/auth/cancel-email-challenge";
import { sendEmailChallenge } from "@/app/actions/auth/send-email-challenge";
import { verifyEmailChallenge } from "@/app/actions/auth/verify-email-challenge";
import { updateCredentials } from "@/app/settings/login-methods/actions";
import styles from "./LoginMethodsPanel.module.css";

const messages = {
  codeSendFailed: "Could not send a code.",
  codeVerificationFailed: "Could not verify the code.",
  credentialsSaveFailed: "Could not save credentials.",
  credentialsUpdated: "Account credentials updated.",
  emailVerified: "Email address verified.",
  emailVerificationSent: "Enter the code sent to the new email address to finish the change.",
  oauthAccountLinked: "This account is already connected to a different xiv.today account.",
  oauthCancelled: "The account connection was cancelled.",
  oauthExpired: "This account connection attempt expired. Start again.",
  oauthFailed: "Could not connect the account. Try again.",
} as const;

type LoginMethodsPanelProps = {
  linkedProviders: string[];
  username: string | null;
  email: string | null;
  oauthError: string | null;
};

export default function LoginMethodsPanel({
  linkedProviders,
  username,
  email,
  oauthError,
}: LoginMethodsPanelProps) {
  const [savedUsername, setSavedUsername] = useState(username);
  const [savedEmail, setSavedEmail] = useState(email);
  const [nextUsername, setNextUsername] = useState(username ?? "");
  const [password, setPassword] = useState("");
  const [nextEmail, setNextEmail] = useState(email ?? "");
  const [emailCode, setEmailCode] = useState("");
  const [emailPending, setEmailPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const hasCredentials = Boolean(savedUsername);
  const returnTo = "/settings/login-methods";
  const oauthErrorMessage =
    oauthError === "oauth-account-linked"
      ? messages.oauthAccountLinked
      : oauthError === "oauth-cancelled"
        ? messages.oauthCancelled
        : oauthError === "oauth-expired"
          ? messages.oauthExpired
          : oauthError
            ? messages.oauthFailed
            : null;

  async function submitCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await updateCredentials({ username: nextUsername, password });

      if ("error" in result) {
        setError(result.error.message);
        return;
      }

      const savedValue = result.username ?? nextUsername;
      setSavedUsername(savedValue);
      setNextUsername(savedValue);
      setPassword("");
      setMessage(messages.credentialsUpdated);
    } catch {
      setError(messages.credentialsSaveFailed);
    } finally {
      setLoading(false);
    }
  }

  async function sendEmailCode() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await sendEmailChallenge({ email: nextEmail, purpose: "email-change" });

      if (result?.error) {
        setError(result.error.message);
        return;
      }

      setEmailPending(true);
      setMessage(messages.emailVerificationSent);
    } catch {
      setError(messages.codeSendFailed);
    } finally {
      setLoading(false);
    }
  }

  async function verifyEmailCode() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await verifyEmailChallenge({ code: emailCode });

      if (result?.error) {
        setError(result.error.message);
        return;
      }

      setSavedEmail(nextEmail);
      setEmailCode("");
      setEmailPending(false);
      setMessage(messages.emailVerified);
    } catch {
      setError(messages.codeVerificationFailed);
    } finally {
      setLoading(false);
    }
  }

  async function cancelEmailChange() {
    await cancelEmailChallenge();
    setEmailPending(false);
    setEmailCode("");
    setNextEmail(savedEmail ?? "");
  }

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Account</p>
          <h1 className={styles.title}>Sign-in settings</h1>
          <p className={styles.subtitle}>Manage the ways you can access your xiv.today account.</p>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Username and password</h2>
            <p className={styles.cardDescription}>
              Use your username or verified email with a password when one is set.
            </p>
          </div>
          <span className={hasCredentials ? styles.statusReady : styles.statusEmpty}>
            {hasCredentials ? "Set up" : "Not set up"}
          </span>
        </div>

        <form className={styles.form} onSubmit={submitCredentials}>
          <label className={styles.label} htmlFor="username">
            Username
          </label>
            <input
            id="username"
            className={styles.input}
            value={nextUsername}
            minLength={2}
            maxLength={32}
            pattern="[A-Za-z0-9_-]+"
            autoComplete="username"
            onChange={(event) => setNextUsername(event.target.value)}
          />

          <label className={styles.label} htmlFor="password">
            {hasCredentials ? "New password (optional)" : "Password"}
          </label>
          <input
            id="password"
            className={styles.input}
            type="password"
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}

          <button className={styles.submitButton} type="submit" disabled={loading}>
            {loading ? "Saving..." : hasCredentials ? "Update credentials" : "Set up credentials"}
          </button>
        </form>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Email</h2>
            <p className={styles.cardDescription}>
              {savedEmail ? `Verified: ${savedEmail}` : "Add an email address for one-time-code sign-in."}
            </p>
          </div>
          <span className={savedEmail ? styles.statusReady : styles.statusEmpty}>
            {savedEmail ? "Verified" : "Not set up"}
          </span>
        </div>

        <div className={styles.form}>
          <label className={styles.label} htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            className={styles.input}
            type="email"
            autoComplete="email"
            value={nextEmail}
            onChange={(event) => setNextEmail(event.target.value)}
            disabled={emailPending}
          />

          {emailPending ? (
            <>
              <label className={styles.label} htmlFor="email-code">
                Verification code
              </label>
              <input
                id="email-code"
                className={styles.input}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={emailCode}
                onChange={(event) => setEmailCode(event.target.value)}
              />
              <button className={styles.submitButton} type="button" disabled={loading} onClick={() => void verifyEmailCode()}>
                {loading ? "Verifying..." : "Verify email"}
              </button>
              <button className={styles.cancelButton} type="button" onClick={() => void cancelEmailChange()}>
                Cancel
              </button>
            </>
          ) : (
            <button className={styles.submitButton} type="button" disabled={loading || !nextEmail} onClick={() => void sendEmailCode()}>
              {loading ? "Sending..." : "Send verification code"}
            </button>
          )}

          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Linked accounts</h2>
            <p className={styles.cardDescription}>
              Connect Discord or Google to sign in directly to this account.
            </p>
          </div>
        </div>

        <div className={styles.providerList}>
          <form className={styles.providerForm} action="/api/auth/link/start" method="post">
            <input name="provider" type="hidden" value="discord" />
            <input name="returnTo" type="hidden" value={returnTo} />
            <button className={styles.providerButton} type="submit">
              <FaDiscord aria-hidden="true" />
              {linkedProviders.includes("discord") ? "Reconnect Discord" : "Connect Discord"}
            </button>
          </form>
          <form className={styles.providerForm} action="/api/auth/link/start" method="post">
            <input name="provider" type="hidden" value="google" />
            <input name="returnTo" type="hidden" value={returnTo} />
            <button className={styles.providerButton} type="submit">
              <FaGoogle aria-hidden="true" />
              {linkedProviders.includes("google") ? "Reconnect Google" : "Connect Google"}
            </button>
          </form>
        </div>
        {oauthErrorMessage ? <p className={styles.error}>{oauthErrorMessage}</p> : null}
      </section>
    </div>
  );
}
