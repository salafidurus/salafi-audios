"use client";

import { useEffect } from "react";

export type ThemePreference = "system" | "light" | "dark";

const THEME_KEY = "theme-preference";
const THEME_CHANGE_EVENT = "theme-change";

function applyTheme(preference: ThemePreference, mediaQuery: MediaQueryList) {
  const resolved = preference === "system"
    ? (mediaQuery.matches ? "dark" : "light")
    : preference;
  document.documentElement.setAttribute("data-theme", resolved);
}

export function ThemeSync() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      const stored = localStorage.getItem(THEME_KEY) as ThemePreference | null;
      const preference: ThemePreference =
        stored === "light" || stored === "dark" ? stored : "system";
      applyTheme(preference, mediaQuery);
    };

    // Apply on mount from localStorage
    syncTheme();

    // Re-sync when OS preference changes (only affects "system" mode)
    mediaQuery.addEventListener("change", syncTheme);

    // Re-sync when the settings screen dispatches a theme-change event
    window.addEventListener(THEME_CHANGE_EVENT, syncTheme);

    return () => {
      mediaQuery.removeEventListener("change", syncTheme);
      window.removeEventListener(THEME_CHANGE_EVENT, syncTheme);
    };
  }, []);

  return null;
}
