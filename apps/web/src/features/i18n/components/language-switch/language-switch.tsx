"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { SUPPORTED_LOCALES, type Locale } from "@sd/core-i18n";
import { useTranslation } from "@/core/i18n/use-translation";
import { setLocaleCookie } from "@/core/i18n/locale-cookie";
import styles from "./language-switch.module.css";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export function LanguageSwitch() {
  const { i18n, t } = useTranslation();
  const { refresh } = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeLocale =
    (i18n.language as Locale) in LOCALE_LABELS ? (i18n.language as Locale) : "en";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const handleSelect = async (locale: Locale) => {
    setOpen(false);
    if (i18n.language === locale) return;

    await i18n.changeLanguage(locale);
    setLocaleCookie(locale);
    // Content queries carry the locale via Accept-Language; refetch so cached
    // results are replaced with the newly selected language.
    await queryClient.invalidateQueries();
    refresh();
  };

  return (
    <div className={styles.switcher} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("navigation.languageSwitch", "Language")}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{LOCALE_LABELS[activeLocale]}</span>
        <span aria-hidden className={styles.chevron}>
          ▾
        </span>
      </button>

      {open && (
        <ul className={styles.menu} role="listbox">
          {SUPPORTED_LOCALES.map((locale) => {
            const isActive = locale === activeLocale;
            return (
              <li key={locale} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={styles.option}
                  data-active={isActive}
                  onClick={() => void handleSelect(locale)}
                >
                  {LOCALE_LABELS[locale]}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
