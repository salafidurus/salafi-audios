"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./legal-screens.module.css";

export function PrivacyMobileScreen() {
  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.title}>Privacy Policy</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Information We Collect</h2>
          <p className={styles.paragraph}>
            We collect information you provide when creating an account and usage data such as
            listening history. We do not sell your personal information.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
          <p className={styles.paragraph}>
            Your information is used to provide the service, personalize your experience, and
            communicate important updates.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Storage &amp; Security</h2>
          <p className={styles.paragraph}>
            Your data is stored securely with industry-standard encryption. We retain your data only
            while your account is active.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact</h2>
          <p className={styles.paragraph}>privacy@salafidurus.com</p>
        </section>
      </div>
    </ScreenView>
  );
}
