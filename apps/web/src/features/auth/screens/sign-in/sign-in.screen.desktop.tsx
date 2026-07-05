"use client";

import Image from "next/image";
import { useTranslation } from "@/core/i18n/use-translation";
import { authClient } from "@/core/auth";
import { buildOAuthCallbackURL } from "@/features/auth/oauth-callback-url";
import { GoogleSignInButton, AppleSignInButton } from "@/features/auth/components/social-buttons";
import styles from "../auth-form.module.css";

type SignInDesktopScreenProps = {
  redirectTo: string;
};

export function SignInDesktopScreen({ redirectTo }: SignInDesktopScreenProps) {
  const { t } = useTranslation();

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <Image
              src="/logo/logo_72.png"
              alt="Salafi Durus Logo"
              width={72}
              height={72}
              priority
            />
          </div>
          <h1 className={styles.title}>Salafi Durus</h1>
          <p className={styles.tagline}>
            {t("auth.signIn.tagline", "Join the community of learners")}
          </p>
        </div>

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
        </div>
      </div>
    </main>
  );
}
