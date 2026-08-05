"use client";

import { useEffect } from "react";

import {
  ACCENT_THEME_CHANGE_EVENT,
  getDefaultAccentTheme,
  getAccentThemePreference,
  isAccentThemeId,
} from "./theme/accent-theme";

export type ThemePreference = "system" | "light" | "dark";

export const THEME_KEY = "theme-preference:v1";
export const THEME_CHANGE_EVENT = "theme-change";

function applyTheme(preference: ThemePreference, mediaQuery: MediaQueryList) {
  const resolved = preference === "system" ? (mediaQuery.matches ? "dark" : "light") : preference;
  document.documentElement.setAttribute("data-theme", resolved);
}

function applyAccentTheme() {
  const preference = getAccentThemePreference();
  document.documentElement.setAttribute("data-accent-theme", preference);
}

function syncAccentTheme() {
  if (typeof window === "undefined") return;
  const stored = window.localStorage.getItem("accent-theme:v1");
  if (!isAccentThemeId(stored)) {
    const newDefault = getDefaultAccentTheme();
    document.documentElement.setAttribute("data-accent-theme", newDefault);
  }
}

export function ThemeSync() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      const stored = localStorage.getItem(THEME_KEY) as ThemePreference | null;
      const preference: ThemePreference =
        stored === "light" || stored === "dark" ? stored : "system";
      applyTheme(preference, mediaQuery);
      syncAccentTheme();
    };

    // Apply on mount from localStorage
    syncTheme();
    applyAccentTheme();

    // Re-sync when OS preference changes (only affects "system" mode)
    const handleMediaChange = () => {
      syncTheme();
      syncAccentTheme();
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    // Re-sync when the settings screen dispatches a theme-change event
    window.addEventListener(THEME_CHANGE_EVENT, syncTheme);
    window.addEventListener(ACCENT_THEME_CHANGE_EVENT, applyAccentTheme);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener(THEME_CHANGE_EVENT, syncTheme);
      window.removeEventListener(ACCENT_THEME_CHANGE_EVENT, applyAccentTheme);
    };
  }, []);

  return null;
}

