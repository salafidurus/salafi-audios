"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./legal-screens.module.css";

export function TermsOfUseMobileScreen() {
  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.title}>Terms of Use</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Acceptance of Terms</h2>
          <p className={styles.paragraph}>
            By using Salafi Durus, you agree to these Terms. If you do not agree, do not use the
            service.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Use of the Service</h2>
          <p className={styles.paragraph}>
            Content is for personal, non-commercial use. Do not redistribute or commercially exploit
            the content.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>User Accounts</h2>
          <p className={styles.paragraph}>
            You are responsible for your account credentials and all activity under your account.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Content &amp; IP</h2>
          <p className={styles.paragraph}>
            Audio content belongs to the scholars. Platform design and code belong to Salafi Durus.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact</h2>
          <p className={styles.paragraph}>legal@salafidurus.com</p>
        </section>
      </div>
    </ScreenView>
  );
}
