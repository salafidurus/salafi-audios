"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./legal-screens.module.css";

export function PrivacyDesktopScreen() {
  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.title}>Privacy Policy</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Information We Collect</h2>
          <p className={styles.paragraph}>
            We collect information you provide when creating an account (email, display name) and
            usage data such as listening history and saved lectures. We do not sell your personal
            information to third parties.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
          <p className={styles.paragraph}>
            Your information is used to provide and improve the service, personalize your experience
            (e.g., resume playback, recommendations), and communicate important updates about the
            platform.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Storage &amp; Security</h2>
          <p className={styles.paragraph}>
            Your data is stored securely using industry-standard encryption. Audio files are served
            via secure, time-limited URLs. We retain your data only as long as your account is
            active.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact</h2>
          <p className={styles.paragraph}>
            For privacy-related inquiries, contact us at privacy@salafidurus.com.
          </p>
        </section>
      </div>
    </ScreenView>
  );
}
