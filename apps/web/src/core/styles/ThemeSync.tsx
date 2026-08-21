"use client";

import { useEffect } from "react";

import { hasWindow } from "@/shared/lib/runtime-guards";

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
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.classList.toggle("dark", resolved === "dark");
}

function applyAccentTheme() {
  const preference = getAccentThemePreference();
  document.documentElement.setAttribute("data-accent-theme", preference);
}

function syncAccentTheme() {
  if (!hasWindow()) return;
  const stored = window.localStorage.getItem("accent-theme:v1");
  if (!isAccentThemeId(stored)) {
    const newDefault = getDefaultAccentTheme();
    document.documentElement.setAttribute("data-accent-theme", newDefault);
  }
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
