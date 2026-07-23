"use client";

import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./language-bar.module.css";

interface LanguageBarProps {
  mainLanguage: "en" | "ar";
  activeLocale: "en" | "ar";
  onLocaleChange: (locale: "en" | "ar") => void;
}

export function LanguageBar({ mainLanguage, activeLocale, onLocaleChange }: LanguageBarProps) {
  const { t } = useTranslation();

  const locales: { code: "en" | "ar"; label: string }[] = [
    { code: mainLanguage, label: t("common.main", "Main") },
    {
      code: mainLanguage === "en" ? "ar" : "en",
      label: mainLanguage === "en" ? "العربية" : "English",
    },
  ];

  return (
    <div className={styles.languageBar}>
      {locales.map((locale) => (
        <button
          key={locale.code}
          className={`${styles.tab} ${activeLocale === locale.code ? styles.active : ""}`}
          onClick={() => onLocaleChange(locale.code)}
          type="button"
        >
          {locale.label}
        </button>
      ))}
    </div>
  );
}
