"use client";

import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./legal-screens.module.css";

export function PrivacyScreen() {
  const isDesktop = useIsDesktop();
  const { t } = useTranslation();

  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.title}>{t("legal.privacy.title", "Privacy Policy")}</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {t("legal.privacy.sections.collect.title", "Information We Collect")}
          </h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? t(
                  "legal.privacy.sections.collect.desktop",
                  "We collect information you provide when creating an account (email, display name) and usage data such as listening history and saved lectures. We do not sell your personal information to third parties.",
                )
              : t(
                  "legal.privacy.sections.collect.mobile",
                  "We collect information you provide when creating an account and usage data such as listening history. We do not sell your personal information.",
                )}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {t("legal.privacy.sections.use.title", "How We Use Your Information")}
          </h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? t(
                  "legal.privacy.sections.use.desktop",
                  "Your information is used to provide and improve the service, personalize your experience (e.g., resume playback, recommendations), and communicate important updates about the platform.",
                )
              : t(
                  "legal.privacy.sections.use.mobile",
                  "Your information is used to provide the service, personalize your experience, and communicate important updates.",
                )}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {t("legal.privacy.sections.storage.title", "Data Storage & Security")}
          </h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? t(
                  "legal.privacy.sections.storage.desktop",
                  "Your data is stored securely using industry-standard encryption. Audio files are served via secure, time-limited URLs. We retain your data only as long as your account is active.",
                )
              : t(
                  "legal.privacy.sections.storage.mobile",
                  "Your data is stored securely with industry-standard encryption. We retain your data only while your account is active.",
                )}
          </p>
        </section>

        <section id="cookies" className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {t("legal.privacy.sections.cookies.title", "Cookies & Tracking Technologies")}
          </h2>
          <p className={styles.paragraph}>
            {t(
              "legal.privacy.sections.cookies.text",
              "We use Vexo Analytics, a third-party analytics service, to understand how users interact with our platform and to improve our service. By continuing to use Salafi Durus, you accept our use of tracking cookies and analytics. We do not sell your personal information to third parties. For more details, please see our Cookie Policy.",
            )}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {t("legal.privacy.sections.contact.title", "Contact")}
          </h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? t(
                  "legal.privacy.sections.contact.desktop",
                  "For privacy-related inquiries, contact us at privacy@salafidurus.com.",
                )
              : t("legal.privacy.sections.contact.mobile", "privacy@salafidurus.com")}
          </p>
        </section>
      </div>
    </ScreenView>
  );
}
