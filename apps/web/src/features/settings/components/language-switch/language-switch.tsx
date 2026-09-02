/** Documents this module's responsibility and public boundary. */
"use client";

import { SUPPORTED_LOCALES, type Locale } from "@sd/core-i18n";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Globe, Languages } from "lucide-react";
import { useRouter } from "next/navigation";

import { setLocaleCookie } from "@/core/i18n/locale-cookie";
import { useTranslation } from "@/core/i18n/use-translation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import styles from "./language-switch.module.css";

const LOCALE_LABELS = {
  en: "English",
  ar: "العربية",
} satisfies Record<Locale, string>;

interface LanguageSwitchProps {
  direction?: "up" | "down";
  collapsed?: boolean;
}

/** Changes the active locale, clears stale query data, and refreshes the current route. */
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
    <Select value={activeLocale} onValueChange={handleSelect}>
      <SelectTrigger
        aria-label={t("navigation.languageSwitch", "Language")}
        size="sm"
        className={clsx(styles.trigger, styles.languageSwitch, collapsed && styles.collapsed)}
      >
        {collapsed ? (
          <Languages size={18} />
        ) : (
          <SelectValue aria-label={LOCALE_LABELS[activeLocale]}>
            <Globe aria-hidden="true" size={14} />
            <span>{LOCALE_LABELS[activeLocale]}</span>
          </SelectValue>
        )}
      </SelectTrigger>
      <SelectContent side={direction === "up" ? "top" : "bottom"}>
        {SUPPORTED_LOCALES.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {LOCALE_LABELS[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
