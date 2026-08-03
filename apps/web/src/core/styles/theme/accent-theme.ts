import { ACCENT_THEME_IDS, type AccentThemeId } from "./variants";

export const ACCENT_THEME_KEY = "accent-theme:v1";
export const ACCENT_THEME_CHANGE_EVENT = "accent-theme-change";

export const isAccentThemeId = (value: unknown): value is AccentThemeId =>
  typeof value === "string" && (ACCENT_THEME_IDS as readonly string[]).includes(value);

export const getAccentThemePreference = (): AccentThemeId => {
  if (typeof window === "undefined") {
    return "default";
  }
  const stored = window.localStorage.getItem(ACCENT_THEME_KEY);
  return isAccentThemeId(stored) ? stored : "default";
};

export const setAccentThemePreference = (id: AccentThemeId): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(ACCENT_THEME_KEY, id);
  window.dispatchEvent(new Event(ACCENT_THEME_CHANGE_EVENT));
};
