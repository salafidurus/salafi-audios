/** Documents this module's responsibility and public boundary. */
"use client";

import { routes } from "@sd/core-contracts";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { LanguageSwitch } from "@/features/settings";
import { ThemeSwitch } from "@/features/settings/components/theme-switch/theme-switch";

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
          <Link href={routes.cookiePolicy}>{t("footer.cookiePolicy")}</Link>
          <Link href={routes.support}>{t("footer.support")}</Link>
        </div>
        <div className={styles.footerControls}>
          <LanguageSwitch direction="up" />
          <ThemeSwitch className={styles.themeSwitch} />
        </div>
      </div>
    </footer>
  );
}
