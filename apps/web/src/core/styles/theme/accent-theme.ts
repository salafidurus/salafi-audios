import { ACCENT_THEME_IDS, type AccentThemeId } from "./variants";

export const ACCENT_THEME_KEY = "accent-theme:v1";
export const ACCENT_THEME_CHANGE_EVENT = "accent-theme-change";

export const isAccentThemeId = (value: unknown): value is AccentThemeId =>
  typeof value === "string" && (ACCENT_THEME_IDS as readonly string[]).includes(value);

/** Returns the resolved accent theme for SSR (no window access). */
export const getDefaultAccentTheme = (): AccentThemeId => {
  if (typeof window === "undefined") {
    return "parchment";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "manuscript" : "parchment";
};

export const getAccentThemePreference = (): AccentThemeId => {
  if (typeof window === "undefined") {
    return "parchment";
  }
  const stored = window.localStorage.getItem(ACCENT_THEME_KEY);
  if (isAccentThemeId(stored)) {
    return stored;
  }
  return getDefaultAccentTheme();
};

export const setAccentThemePreference = (id: AccentThemeId): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(ACCENT_THEME_KEY, id);
  window.dispatchEvent(new Event(ACCENT_THEME_CHANGE_EVENT));
};
