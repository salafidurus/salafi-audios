"use client";

import { useState } from "react";
import { useTranslation } from "@/core/i18n/use-translation";
import { routes } from "@sd/core-contracts";
import { authClient } from "@/core/auth";
import { GoogleSignInButton, AppleSignInButton } from "@/features/auth/components/social-buttons";
import styles from "../auth-form.module.css";

type SignUpDesktopScreenProps = {
  redirectTo: string;
  onNavigateToSignIn: () => void;
};

export function SignUpDesktopScreen({ redirectTo, onNavigateToSignIn }: SignUpDesktopScreenProps) {
  const { t } = useTranslation();
  const [termsAccepted, setTermsAccepted] = useState(false);

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
