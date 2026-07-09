"use client";

import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./legal-screens.module.css";

export function PrivacyScreen() {
  const isDesktop = useIsDesktop();

  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.title}>Privacy Policy</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Information We Collect</h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? "We collect information you provide when creating an account (email, display name) and usage data such as listening history and saved lectures. We do not sell your personal information to third parties."
              : "We collect information you provide when creating an account and usage data such as listening history. We do not sell your personal information."}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? "Your information is used to provide and improve the service, personalize your experience (e.g., resume playback, recommendations), and communicate important updates about the platform."
              : "Your information is used to provide the service, personalize your experience, and communicate important updates."}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Storage &amp; Security</h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? "Your data is stored securely using industry-standard encryption. Audio files are served via secure, time-limited URLs. We retain your data only as long as your account is active."
              : "Your data is stored securely with industry-standard encryption. We retain your data only while your account is active."}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact</h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? "For privacy-related inquiries, contact us at privacy@salafidurus.com."
              : "privacy@salafidurus.com"}
          </p>
        </section>
      </div>
    </ScreenView>
  );
}
