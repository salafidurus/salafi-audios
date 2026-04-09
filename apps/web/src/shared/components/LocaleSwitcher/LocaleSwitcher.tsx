"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "../Button/Button";
import { setLocaleCookie } from "../../../core/i18n/locale-cookie";

export function LocaleSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();

  const currentLocale = i18n.language as "en" | "ar";
  const nextLocale = currentLocale === "en" ? "ar" : "en";
  const buttonLabel = currentLocale === "en" ? "العربية" : "English";

  const handleChangeLocale = async () => {
    await i18n.changeLanguage(nextLocale);
    setLocaleCookie(nextLocale);
    router.refresh();
  };

  return (
    <Button variant="ghost" onClick={handleChangeLocale}>
      {buttonLabel}
    </Button>
  );
}
