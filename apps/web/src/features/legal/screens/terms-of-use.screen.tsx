"use client";

import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./legal-screens.module.css";

export function TermsOfUseScreen() {
  const isDesktop = useIsDesktop();

  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.title}>Terms of Use</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Acceptance of Terms</h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? "By accessing or using Salafi Durus, you agree to be bound by these Terms of Use. If you do not agree, do not use the service."
              : "By using Salafi Durus, you agree to these Terms. If you do not agree, do not use the service."}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Use of the Service</h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? "Salafi Durus provides access to Islamic audio lectures for personal, non-commercial use. You may not redistribute, modify, or commercially exploit the content without explicit permission from the content owners."
              : "Content is for personal, non-commercial use. Do not redistribute or commercially exploit the content."}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>User Accounts</h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use."
              : "You are responsible for your account credentials and all activity under your account."}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Content &amp; Intellectual Property</h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? "All audio content is provided by scholars and remains their intellectual property. The platform design, code, and branding are owned by Salafi Durus."
              : "Audio content belongs to the scholars. Platform design and code belong to Salafi Durus."}
          </p>
        </section>

        {isDesktop && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Termination</h2>
            <p className={styles.paragraph}>
              We may suspend or terminate your account if you violate these terms. You may delete
              your account at any time from your account settings.
            </p>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact</h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? "For questions about these terms, contact legal@salafidurus.com."
              : "legal@salafidurus.com"}
          </p>
        </section>
      </div>
    </ScreenView>
  );
}
