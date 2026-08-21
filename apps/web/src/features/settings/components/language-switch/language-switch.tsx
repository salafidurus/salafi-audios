"use client";

import { SUPPORTED_LOCALES, type Locale } from "@sd/core-i18n";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Globe, Languages } from "lucide-react";
import { useRouter } from "next/navigation";

import { setLocaleCookie } from "@/core/i18n/locale-cookie";
import { useTranslation } from "@/core/i18n/use-translation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";

import styles from "./language-switch.module.css";

const LOCALE_LABELS = {
  en: "English",
  ar: "العربية",
} satisfies Record<Locale, string>;

interface LanguageSwitchProps {
  direction?: "up" | "down";
  collapsed?: boolean;
}

export function LanguageSwitch({ direction = "down", collapsed = false }: LanguageSwitchProps) {
  const { i18n, t } = useTranslation();
  const { refresh } = useRouter();
  const queryClient = useQueryClient();

  const activeLocale = SUPPORTED_LOCALES.find((locale) => locale === i18n.language) ?? "en";

  const handleSelect = async (locale: string) => {
    if (i18n.language === locale) {
      return;
    }
    // SAFETY: Dropdown values come only from SUPPORTED_LOCALES below.
    await i18n.changeLanguage(locale as Locale);
    // SAFETY: Dropdown values come only from SUPPORTED_LOCALES below.
    setLocaleCookie(locale as Locale);
    // Content queries carry the locale via Accept-Language. A refetch here
    // would still use the OLD locale and get thrown away by router.refresh()
    // anyway, so clear the cache synchronously instead of invalidating +
    // awaiting a wasted round-trip — mirrors the sign-out cache clear.
    queryClient.clear();
    refresh();
  };

  return (
    <Dropdown
      value={activeLocale}
      onValueChange={handleSelect}
      direction={direction}
      className={clsx(styles.languageSwitch, collapsed && styles.collapsed)}
    >
      <DropdownTrigger
        ariaLabel={t("navigation.languageSwitch", "Language")}
        className={styles.trigger}
      >
        {collapsed ? (
          <Languages size={18} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Globe size={14} color="var(--action-primary)" />
            <span>{LOCALE_LABELS[activeLocale]}</span>
          </div>
        )}
      </DropdownTrigger>
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
