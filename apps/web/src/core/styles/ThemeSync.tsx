/** Documents this module's responsibility and public boundary. */
"use client";

import { useEffect } from "react";

import { hasWindow } from "@/shared/lib/runtime-guards";

import { THEME_KEY, resolveTheme, type ThemePreference } from "./theme-bootstrap";

export { THEME_KEY } from "./theme-bootstrap";
export type { ThemePreference } from "./theme-bootstrap";
export const THEME_CHANGE_EVENT = "theme-change";

function applyTheme(preference: ThemePreference, mediaQuery: MediaQueryList) {
  const resolved = resolveTheme(preference, mediaQuery.matches);
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.classList.toggle("dark", resolved === "dark");
}

function getStoredThemePreference(): ThemePreference {
  if (!hasWindow()) {
    return "system";
  }

  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return "system";
}

export function ThemeSync() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      applyTheme(getStoredThemePreference(), mediaQuery);
    };

    // Apply on mount from localStorage
    syncTheme();

    // Re-sync when OS preference changes (only affects "system" mode)
    const handleMediaChange = () => {
      syncTheme();
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    // Re-sync when the settings screen dispatches a theme-change event
    window.addEventListener(THEME_CHANGE_EVENT, syncTheme);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener(THEME_CHANGE_EVENT, syncTheme);
    };
  }, []);

  return null;
}
