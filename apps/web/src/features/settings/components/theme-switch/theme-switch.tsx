/** Documents this module's responsibility and public boundary. */
"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { THEME_CHANGE_EVENT, THEME_KEY, type ThemePreference } from "@/core/styles/ThemeSync";
import { Button } from "@/shared/components/ui/button";
import { hasWindow } from "@/shared/lib/runtime-guards";

function getResolvedTheme(): "light" | "dark" {
  if (!hasWindow()) return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** Toggles the persisted theme preference and follows changes made elsewhere in the app. */
export function ThemeSwitch({ className }: { className?: string }) {
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
      className={className}
      aria-label={label}
      title={label}
      onClick={handleToggle}
    >
      {resolvedTheme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}
