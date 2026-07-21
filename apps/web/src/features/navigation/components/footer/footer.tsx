"use client";

import Link from "next/link";
import { useTranslation } from "@/core/i18n/use-translation";
import { routes } from "@sd/core-contracts";
import { LanguageSwitch } from "@/features/settings";
import styles from "./footer.module.css";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer
      className={styles.footer}
      aria-label={t("navigation.siteFooter")}
      data-site-footer="true"
    >
      <div className={styles.inner}>
        <span className={styles.meta}>{t("footer.copyright", { year })}</span>
        <div className={styles.links}>
          <Link href={routes.privacy} target="_blank" rel="noopener noreferrer">
            {t("footer.privacy")}
          </Link>
          <Link href={routes.termsOfUse} target="_blank" rel="noopener noreferrer">
            {t("footer.terms")}
          </Link>
          <Link href={routes.support}>{t("footer.support")}</Link>
        </div>
        <div className={styles.languageSwitchWrapper}>
          <LanguageSwitch direction="up" />
        </div>
      </div>
    </footer>
  );
}
