"use client";

import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./legal-screens.module.css";

export function TermsOfUseScreen() {
  const isDesktop = useIsDesktop();
  const { t } = useTranslation();

  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.title}>{t("legal.terms.title", "Terms of Use")}</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {t("legal.terms.sections.acceptance.title", "Acceptance of Terms")}
          </h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? t(
                  "legal.terms.sections.acceptance.desktop",
                  "By accessing or using Salafi Durus, you agree to be bound by these Terms of Use. If you do not agree, do not use the service.",
                )
              : t(
                  "legal.terms.sections.acceptance.mobile",
                  "By using Salafi Durus, you agree to these Terms. If you do not agree, do not use the service.",
                )}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {t("legal.terms.sections.use.title", "Use of the Service")}
          </h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? t(
                  "legal.terms.sections.use.desktop",
                  "Salafi Durus provides access to Islamic audio lectures for personal, non-commercial use. You may not redistribute, modify, or commercially exploit the content without explicit permission from the content owners.",
                )
              : t(
                  "legal.terms.sections.use.mobile",
                  "Content is for personal, non-commercial use. Do not redistribute or commercially exploit the content.",
                )}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {t("legal.terms.sections.accounts.title", "User Accounts")}
          </h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? t(
                  "legal.terms.sections.accounts.desktop",
                  "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.",
                )
              : t(
                  "legal.terms.sections.accounts.mobile",
                  "You are responsible for your account credentials and all activity under your account.",
                )}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {t("legal.terms.sections.property.title", "Content & Intellectual Property")}
          </h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? t(
                  "legal.terms.sections.property.desktop",
                  "All audio content is provided by scholars and remains their intellectual property. The platform design, code, and branding are owned by Salafi Durus.",
                )
              : t(
                  "legal.terms.sections.property.mobile",
                  "Audio content belongs to the scholars. Platform design and code belong to Salafi Durus.",
                )}
          </p>
        </section>

        {isDesktop && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {t("legal.terms.sections.termination.title", "Termination")}
            </h2>
            <p className={styles.paragraph}>
              {t(
                "legal.terms.sections.termination.text",
                "We may suspend or terminate your account if you violate these terms. You may delete your account at any time from your account settings.",
              )}
            </p>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {t("legal.terms.sections.contact.title", "Contact")}
          </h2>
          <p className={styles.paragraph}>
            {isDesktop
              ? t(
                  "legal.terms.sections.contact.desktop",
                  "For questions about these terms, contact legal@salafidurus.com.",
                )
              : t("legal.terms.sections.contact.mobile", "legal@salafidurus.com")}
          </p>
        </section>
      </div>
    </ScreenView>
  );
}
