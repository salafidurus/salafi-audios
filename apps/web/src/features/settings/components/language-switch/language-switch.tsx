"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { SUPPORTED_LOCALES, type Locale } from "@sd/core-i18n";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";
import { useTranslation } from "@/core/i18n/use-translation";
import { setLocaleCookie } from "@/core/i18n/locale-cookie";
import styles from "./language-switch.module.css";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

interface LanguageSwitchProps {
  direction?: "up" | "down";
}

export function LanguageSwitch({ direction = "down" }: LanguageSwitchProps) {
  const { i18n, t } = useTranslation();
  const { refresh } = useRouter();
  const queryClient = useQueryClient();

  const activeLocale =
    (i18n.language as Locale) in LOCALE_LABELS ? (i18n.language as Locale) : "en";

  const handleSelect = async (locale: string) => {
    if (i18n.language === locale) {
      return;
    }
    await i18n.changeLanguage(locale as Locale);
    setLocaleCookie(locale as Locale);
    await queryClient.invalidateQueries();
    refresh();
  };

  return (
    <Dropdown
      value={activeLocale}
      onValueChange={handleSelect}
      direction={direction}
      className={styles.inline}
    >
      <DropdownTrigger ariaLabel={t("navigation.languageSwitch", "Language")} />
      <DropdownContent>
        {SUPPORTED_LOCALES.map((locale) => (
          <DropdownItem key={locale} value={locale}>
            {LOCALE_LABELS[locale]}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  );
}
