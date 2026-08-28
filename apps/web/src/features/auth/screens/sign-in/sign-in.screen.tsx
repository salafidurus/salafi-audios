/** Documents this module's responsibility and public boundary. */
"use client";

import Image from "next/image";
import Link from "next/link";

import { authClient } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { AuthProviderButton } from "@/features/auth/components/provider-button";

import styles from "../auth-form.module.css";

type SignInScreenProps = {
  redirectTo: string;
};

export function SignInResponsiveScreen({ redirectTo }: SignInScreenProps) {
  const { t } = useTranslation();
  const signIn = (provider: "apple" | "google") => {
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "";
    void authClient.signIn.social({
      provider,
      callbackURL: `${webUrl}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
    });
  };

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
          <AuthProviderButton provider="apple" onClick={() => signIn("apple")} />
          <AuthProviderButton provider="google" onClick={() => signIn("google")} />
        </div>

        <p className={styles.privacyNote}>
          {t("auth.signIn.privacyNote")}{" "}
          <Link href="/terms-of-use">{t("termsOfService", "Terms of Use")}</Link>{" "}
          {t("auth.signIn.and")} <Link href="/privacy">{t("privacyPolicy", "Privacy Policy")}</Link>
          .
        </p>
      </div>
    </main>
  );
}
