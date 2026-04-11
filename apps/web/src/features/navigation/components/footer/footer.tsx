"use client";

import Link from "next/link";
import { useTranslation } from "@sd/core-i18n";
import { routes } from "@sd/core-contracts";
import { LanguageSwitch } from "@/features/i18n";
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
          <Link href={routes.privacy}>{t("footer.privacy")}</Link>
          <Link href={routes.termsOfUse}>{t("footer.terms")}</Link>
          <Link href={routes.support}>{t("footer.support")}</Link>
        </div>
        <LanguageSwitch />
      </div>
    </footer>
  );
}
