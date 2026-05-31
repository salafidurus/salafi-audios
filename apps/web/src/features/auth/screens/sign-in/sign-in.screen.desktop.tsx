"use client";

import { useState } from "react";
import { useTranslation } from "@/core/i18n/use-translation";
import { authClient } from "@/core/auth";
import { TextInput } from "@/shared/components/TextInput/TextInput";
import { GoogleSignInButton, AppleSignInButton } from "@/features/auth/components/social-buttons";
import styles from "../auth-form.module.css";

type SignInDesktopScreenProps = {
  redirectTo: string;
  onSignInSuccess: () => void;
  onNavigateToSignUp: () => void;
};

export function SignInDesktopScreen({
  redirectTo,
  onSignInSuccess,
  onNavigateToSignUp,
}: SignInDesktopScreenProps) {
  const { t } = useTranslation();
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

    onSignInSuccess();
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("auth.signIn.title")}</h1>

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

          <div className={styles.divider}>{t("auth.signIn.orContinue")}</div>

          <form onSubmit={handleEmailSignIn} className={styles.form}>
            <div className={styles.inputGroup}>
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder={t("common.email")}
                required
                autoComplete="email"
                className={`${styles.input} ${showEmailError ? styles.inputError : ""}`}
              />
              {showEmailError && (
                <p className={styles.errorText} role="alert">
                  {t("validation.emailInvalid")}
                </p>
              )}
            </div>

            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("common.password")}
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
              {loading ? t("auth.signIn.submitting") : t("auth.signIn.submit")}
            </button>
          </form>

          <p className={styles.footerText}>
            {t("auth.signIn.noAccountSplit")}{" "}
            <button type="button" onClick={onNavigateToSignUp} className={styles.footerLink}>
              {t("auth.signIn.noAccountLink")}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
