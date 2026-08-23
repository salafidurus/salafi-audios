import { z } from "zod";

import { ACCENT_THEME_IDS, type AccentThemeId } from "./variants";

export const ACCENT_THEME_KEY = "accent-theme:v1";
export const ACCENT_THEME_CHANGE_EVENT = "accent-theme-change";
const AccentThemeIdSchema = z.enum(ACCENT_THEME_IDS);

export const isAccentThemeId = (value: string | null): value is AccentThemeId =>
  AccentThemeIdSchema.safeParse(value).success;

/** Returns the resolved accent theme for SSR (no window access). */
export const getDefaultAccentTheme = (): AccentThemeId => {
  if (!globalThis.window) {
    return "parchment";
  }
  const storedTheme = window.localStorage.getItem("theme-preference:v1");
  if (storedTheme === "dark") return "midnight";
  if (storedTheme === "light") return "parchment";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "midnight" : "parchment";
};

export const getAccentThemePreference = (): AccentThemeId => {
  if (!globalThis.window) {
    return "parchment";
  }
  const stored = window.localStorage.getItem(ACCENT_THEME_KEY);
  if (isAccentThemeId(stored)) {
    return stored;
  }
  return getDefaultAccentTheme();
};

export const setAccentThemePreference = (id: AccentThemeId): void => {
  if (!globalThis.window) {
    return;
  }
  window.localStorage.setItem(ACCENT_THEME_KEY, id);
  window.dispatchEvent(new Event(ACCENT_THEME_CHANGE_EVENT));
};
