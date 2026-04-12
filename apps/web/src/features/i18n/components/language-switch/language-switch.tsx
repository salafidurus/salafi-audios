"use client";

import { useRouter } from "next/navigation";
import { SUPPORTED_LOCALES, type Locale } from "@sd/core-i18n";
import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/Button/Button";
import { setLocaleCookie } from "@/core/i18n/locale-cookie";
import styles from "./language-switch.module.css";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export function LanguageSwitch() {
  const { i18n } = useTranslation();
  const router = useRouter();

  const handleChangeLocale = async (locale: Locale) => {
    if (i18n.language === locale) {
      return;
    }

    await i18n.changeLanguage(locale);
    setLocaleCookie(locale);
    router.refresh();
  };

  return (
    <div className={styles.switcher} role="group" aria-label="Language switch">
      {SUPPORTED_LOCALES.map((locale) => {
        const isActive = i18n.language === locale;

        return (
          <Button
            key={locale}
            variant={isActive ? "primary" : "ghost"}
            size="sm"
            className={styles.button}
            aria-pressed={isActive}
            onClick={() => void handleChangeLocale(locale)}
          >
            {LOCALE_LABELS[locale]}
          </Button>
        );
      })}
    </div>
  );
}
