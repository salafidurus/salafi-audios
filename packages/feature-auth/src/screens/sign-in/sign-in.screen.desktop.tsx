"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@sd/core-auth";
import { GoogleSignInButton, AppleSignInButton } from "../../components/social-buttons";
import styles from "../auth-form.module.css";

type SignInDesktopScreenProps = {
  redirectTo: string;
};

export function SignInDesktopScreen({ redirectTo }: SignInDesktopScreenProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const showEmailError = emailTouched && email.length > 0 && !isEmailValid;
  const canSubmit = isEmailValid && password.length > 0;

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: err } = await authClient.signIn.email({ email, password });

    setLoading(false);

    if (err) {
      setError(err.message ?? "Sign in failed");
      return;
    }

    router.push(redirectTo);
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign In</h1>

        <div className={styles.stack}>
          <div className={styles.socialStack}>
            <AppleSignInButton
              onClick={() =>
                authClient.signIn.social({ provider: "apple", callbackURL: redirectTo })
              }
            />
            <GoogleSignInButton
              onClick={() =>
                authClient.signIn.social({ provider: "google", callbackURL: redirectTo })
              }
            />
          </div>

          <div className={styles.divider}>or continue with email</div>

          <form onSubmit={handleEmailSignIn} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="Email"
                required
                autoComplete="email"
                className={`${styles.input} ${showEmailError ? styles.inputError : ""}`}
              />
              {showEmailError && (
                <p className={styles.errorText} role="alert">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              className={styles.input}
            />

            {error ? (
              <p className={styles.errorText} role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={loading || !canSubmit} className={styles.submitButton}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className={styles.footerText}>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className={styles.footerLink}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
