"use client";

import { useReducer, useState } from "react";
import { useTranslation } from "@/core/i18n/use-translation";
import { routes } from "@sd/core-contracts";
import { authClient } from "@/core/auth";
import { TextInput } from "@/shared/components/TextInput/TextInput";
import { GoogleSignInButton, AppleSignInButton } from "@/features/auth/components/social-buttons";
import styles from "../auth-form.module.css";

type SignUpDesktopScreenProps = {
  redirectTo: string;
  onSignUpSuccess: () => void;
  onNavigateToSignIn: () => void;
};

type FormState = { name: string; email: string; password: string };
type FormAction =
  | { field: "name"; value: string }
  | { field: "email"; value: string }
  | { field: "password"; value: string };

function formReducer(state: FormState, action: FormAction): FormState {
  return { ...state, [action.field]: action.value };
}

export function SignUpDesktopScreen({
  redirectTo,
  onSignUpSuccess,
  onNavigateToSignIn,
}: SignUpDesktopScreenProps) {
  const { t } = useTranslation();
  const [form, dispatch] = useReducer(formReducer, { name: "", email: "", password: "" });
  const [emailTouched, setEmailTouched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const showEmailError = emailTouched && form.email.length > 0 && !isEmailValid;
  const canSubmit =
    termsAccepted && isEmailValid && form.name.length > 0 && form.password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: err } = await authClient.signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
    });

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
              value={form.name}
              onChange={(e) => dispatch({ field: "name", value: e.target.value })}
              placeholder={t("common.name")}
              required
              autoComplete="name"
              className={styles.input}
            />

            <div className={styles.inputGroup}>
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => dispatch({ field: "email", value: e.target.value })}
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
              value={form.password}
              onChange={(e) => dispatch({ field: "password", value: e.target.value })}
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
            <button type="button" onClick={onNavigateToSignIn} className={styles.footerLink}>
              {t("auth.signUp.alreadyAccountLink")}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
