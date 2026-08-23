"use client";

import { routes } from "@sd/core-contracts";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { THEME_CHANGE_EVENT, THEME_KEY, type ThemePreference } from "@/core/styles/ThemeSync";
import { LanguageSwitch } from "@/features/settings";
import { Button } from "@/shared/components/ui/button";
import { hasWindow } from "@/shared/lib/runtime-guards";

import styles from "./footer.module.css";

function getResolvedTheme(): "light" | "dark" {
  if (!hasWindow()) return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function ThemeSwitch() {
  const { t } = useTranslation();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(getResolvedTheme);

  useEffect(() => {
    const syncTheme = () => setResolvedTheme(getResolvedTheme());
    window.addEventListener(THEME_CHANGE_EVENT, syncTheme);
    syncTheme();
    return () => window.removeEventListener(THEME_CHANGE_EVENT, syncTheme);
  }, []);

  const nextTheme: ThemePreference = resolvedTheme === "dark" ? "light" : "dark";
  const label =
    nextTheme === "dark"
      ? t("navigation.switchToDark", "Switch to dark mode")
      : t("navigation.switchToLight", "Switch to light mode");

  const handleToggle = () => {
    if (!hasWindow()) return;
    localStorage.setItem(THEME_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    setResolvedTheme(nextTheme);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={styles.themeSwitch}
      aria-label={label}
      title={label}
      onClick={handleToggle}
    >
      {resolvedTheme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}

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
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  );
}
