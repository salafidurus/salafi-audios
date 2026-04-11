"use client";

import { useState } from "react";
import { useTranslation } from "@sd/core-i18n";
import { routes } from "@sd/core-contracts";
import { authClient } from "../../../../core/auth";
import { TextInput } from "../../../../shared/components/TextInput/TextInput";
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
  const { t } = useTranslation();
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
        <h1 className={styles.title}>{t("auth.signUp.title")}</h1>

        <div className={styles.stack}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className={styles.checkbox}
            />
            <span>
              {t("auth.signUp.iAgreeTo")}{" "}
              <a href={routes.termsOfUse} className={styles.inlineLink}>
                {t("common.termsOfService")}
              </a>{" "}
              {t("common.and")}{" "}
              <a href={routes.privacy} className={styles.inlineLink}>
                {t("common.privacyPolicy")}
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

          <div className={styles.divider}>{t("auth.signUp.orEmail")}</div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("common.name")}
              required
              autoComplete="name"
              className={styles.input}
            />

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
              autoComplete="new-password"
              className={styles.input}
            />

            {error ? (
              <p className={styles.errorText} role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={loading || !canSubmit} className={styles.submitButton}>
              {loading ? t("auth.signUp.submitting") : t("auth.signUp.submit")}
            </button>
          </form>

          <p className={styles.footerText}>
            {t("auth.signUp.alreadyAccountSplit")}{" "}
            <a
              href={routes.signIn}
              onClick={(e) => {
                e.preventDefault();
                onNavigateToSignIn();
              }}
              className={styles.footerLink}
            >
              {t("auth.signUp.alreadyAccountLink")}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
