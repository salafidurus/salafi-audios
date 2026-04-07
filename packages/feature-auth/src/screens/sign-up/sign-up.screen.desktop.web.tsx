"use client";

import { useState } from "react";
import { authClient } from "@sd/core-auth";
import { TextInputWeb } from "@sd/shared";
import { GoogleSignInButton, AppleSignInButton } from "../../components/social-buttons";
import styles from "../auth-form.module.css";

type SignUpDesktopScreenProps = {
  redirectTo: string;
  onSignUpSuccess: () => void;
  onNavigateToSignIn: () => void;
};

export function SignUpDesktopScreen({
  redirectTo,
  onSignUpSuccess,
  onNavigateToSignIn,
}: SignUpDesktopScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const showEmailError = emailTouched && email.length > 0 && !isEmailValid;
  const canSubmit = termsAccepted && isEmailValid && name.length > 0 && password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: err } = await authClient.signUp.email({ name, email, password });

    setLoading(false);

    if (err) {
      setError(err.message ?? "Sign up failed");
      return;
    }

    onSignUpSuccess();
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>

        <div className={styles.stack}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className={styles.checkbox}
            />
            <span>
              I agree to the{" "}
              <a href="/terms-of-use" className={styles.inlineLink}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className={styles.inlineLink}>
                Privacy Policy
              </a>
            </span>
          </label>

          <div className={styles.socialStack}>
            <AppleSignInButton
              onClick={() =>
                authClient.signIn.social({ provider: "apple", callbackURL: redirectTo })
              }
              disabled={!termsAccepted}
            />
            <GoogleSignInButton
              onClick={() =>
                authClient.signIn.social({ provider: "google", callbackURL: redirectTo })
              }
              disabled={!termsAccepted}
            />
          </div>

          <div className={styles.divider}>or sign up with email</div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <TextInputWeb
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
              autoComplete="name"
              className={styles.input}
            />

            <div className={styles.inputGroup}>
              <TextInputWeb
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

            <TextInputWeb
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="new-password"
              className={styles.input}
            />

            {error ? (
              <p className={styles.errorText} role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={loading || !canSubmit} className={styles.submitButton}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className={styles.footerText}>
            Already have an account?{" "}
            <a
              href="/sign-in"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToSignIn();
              }}
              className={styles.footerLink}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
