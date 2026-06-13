"use client";

import { useTranslation } from "@/core/i18n/use-translation";
import { authClient } from "@/core/auth";
import { buildOAuthCallbackURL } from "@/features/auth/oauth-callback-url";
import { GoogleSignInButton, AppleSignInButton } from "@/features/auth/components/social-buttons";
import styles from "../auth-form.module.css";

type SignInDesktopScreenProps = {
  redirectTo: string;
  onNavigateToSignUp: () => void;
};

export function SignInDesktopScreen({ redirectTo, onNavigateToSignUp }: SignInDesktopScreenProps) {
  const { t } = useTranslation();

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("auth.signIn.title")}</h1>

        <div className={styles.stack}>
          <div className={styles.socialStack}>
            <AppleSignInButton
              onClick={() =>
                authClient.signIn.social({
                  provider: "apple",
                  callbackURL: buildOAuthCallbackURL(redirectTo),
                })
              }
            />
            <GoogleSignInButton
              onClick={() =>
                authClient.signIn.social({
                  provider: "google",
                  callbackURL: buildOAuthCallbackURL(redirectTo),
                })
              }
            />
          </div>

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
