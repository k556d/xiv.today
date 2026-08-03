"use client";

import { useState } from "react";
import { FaDiscord, FaUser, FaXmark } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { register } from "@/app/actions/auth/register";
import { sendEmailChallenge } from "@/app/actions/auth/send-email-challenge";
import { signIn } from "@/app/actions/auth/sign-in";
import { verifyEmailChallenge } from "@/app/actions/auth/verify-email-challenge";
import styles from "./LoginModal.module.css";

const messages = {
  codeInvalid: "Invalid or expired code.",
  codeSendFailed: "Could not send a code.",
  codeVerificationFailed: "Could not verify the code.",
  continueFailed: "Could not continue.",
} as const;

type Mode = "choose" | "credentials" | "register" | "email" | "email-code";
type EmailPurpose = "sign-in" | "sign-up";

export default function LoginModal({
  initialError = "",
  onClose,
  returnTo,
}: {
  initialError?: string;
  onClose: () => void;
  returnTo?: string;
}) {
  const [mode, setMode] = useState<Mode>("choose");
  const [emailPurpose, setEmailPurpose] = useState<EmailPurpose>("sign-in");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  async function submitCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await (mode === "register" ? register : signIn)(new FormData(event.currentTarget));

      if (result?.error) {
        setError(result.error.message);
        return;
      }

      onClose();
    } catch {
      setError(messages.continueFailed);
    } finally {
      setLoading(false);
    }
  }

  async function submitEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await sendEmailChallenge({ email, purpose: emailPurpose });

      if (result?.error) {
        setError(result.error.message);
        return;
      }

      setMode("email-code");
    } catch {
      setError(messages.codeSendFailed);
    } finally {
      setLoading(false);
    }
  }

  async function verifyEmailCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const code = new FormData(event.currentTarget).get("code");
      const result = await verifyEmailChallenge({ code: typeof code === "string" ? code : "" });

      if (result?.error) {
        setError(result.error.message);
        return;
      }

      onClose();
    } catch {
      setError(messages.codeVerificationFailed);
    } finally {
      setLoading(false);
    }
  }

  function setOAuthReturnTo(event: React.FormEvent<HTMLFormElement>) {
    const input = event.currentTarget.querySelector<HTMLInputElement>("input[name=returnTo]");

    if (input) {
      input.value = returnTo ?? `${window.location.pathname}${window.location.search}${window.location.hash}`;
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton} aria-label="Close">
          <FaXmark aria-hidden="true" />
        </button>

        <h2 className={styles.title}>
          {mode === "choose" && "Welcome to xiv.today"}
          {mode === "credentials" && "Sign in"}
          {mode === "register" && "Create account"}
          {mode === "email" && (emailPurpose === "sign-in" ? "Sign in with email" : "Create account with email")}
          {mode === "email-code" && "Enter your code"}
        </h2>

        {mode === "choose" ? (
          <div className={styles.choiceStack}>
            {error ? <p className={styles.error}>{error}</p> : null}
            <button onClick={() => setMode("credentials")} className={styles.choiceButton}>
              <FaUser aria-hidden="true" />
              Continue with password
            </button>
            <button
              onClick={() => {
                setEmailPurpose("sign-in");
                setMode("email");
              }}
              className={styles.choiceButton}
            >
              Continue with email code
            </button>
            <form className={styles.choiceForm} action="/api/auth/sign-in/start" method="post" onSubmit={setOAuthReturnTo}>
              <input name="provider" type="hidden" value="discord" />
              <input name="returnTo" type="hidden" />
              <button className={`${styles.choiceButton} ${styles.choiceButtonDiscord}`} type="submit">
                <FaDiscord aria-hidden="true" />
                Continue with Discord
              </button>
            </form>
            <form className={styles.choiceForm} action="/api/auth/sign-in/start" method="post" onSubmit={setOAuthReturnTo}>
              <input name="provider" type="hidden" value="google" />
              <input name="returnTo" type="hidden" />
              <button className={styles.choiceButton} type="submit">
                <FcGoogle aria-hidden="true" />
                Continue with Google
              </button>
            </form>
            <button onClick={() => setMode("register")} className={styles.helpButton}>
              Create a new account
            </button>
          </div>
        ) : null}

        {mode === "credentials" || mode === "register" ? (
          <form onSubmit={submitCredentials} className={styles.form}>
            <div>
              <label htmlFor="identifier" className={styles.label}>
                {mode === "register" ? "Username" : "Username or email"}
              </label>
              <input
                id="identifier"
                name={mode === "register" ? "username" : "identifier"}
                type="text"
                required
                minLength={2}
                maxLength={320}
                autoComplete={mode === "register" ? "username" : "username"}
                className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                className={styles.input}
              />
            </div>
            {error ? <p className={styles.error}>{error}</p> : null}
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? "Please wait..." : mode === "register" ? "Create account" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEmailPurpose("sign-up");
                setMode("email");
                setError("");
              }}
              className={styles.helpButton}
            >
              Create account with email instead
            </button>
          </form>
        ) : null}

        {mode === "email" ? (
          <form onSubmit={submitEmail} className={styles.form}>
            <div>
              <label htmlFor="email" className={styles.label}>Email address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className={styles.input}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            {error ? <p className={styles.error}>{error}</p> : null}
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? "Sending..." : "Send code"}
            </button>
          </form>
        ) : null}

        {mode === "email-code" ? (
          <form onSubmit={verifyEmailCode} className={styles.form}>
            <div>
              <label htmlFor="code" className={styles.label}>Code</label>
              <input id="code" name="code" required inputMode="numeric" autoComplete="one-time-code" className={styles.input} />
            </div>
            {error ? <p className={styles.error}>{error}</p> : null}
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? "Verifying..." : "Verify code"}
            </button>
          </form>
        ) : null}

        {mode !== "choose" ? (
          <button
            type="button"
            onClick={() => {
              setMode("choose");
              setError("");
            }}
            className={styles.backButton}
          >
            Back
          </button>
        ) : null}
      </div>
    </div>
  );
}
