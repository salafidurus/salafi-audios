/**
 * Centralized, statically-extractable translation keys for navigation subnav
 * labels and feed/live state text. The literal-string maps below let
 * i18next-parser trace every key (dynamic `t(\`...${id}\`)` calls cannot be
 * parsed statically).
 */

export const SUBNAV_KEYS: Record<string, Record<string, string>> = {
  explore: {
    popular: "navigation.subnav.explore.popular",
    recent: "navigation.subnav.explore.recent",
    following: "navigation.subnav.explore.following",
  },
  library: {
    started: "navigation.subnav.library.started",
    saved: "navigation.subnav.library.saved",
    completed: "navigation.subnav.library.completed",
  },
  settings: {
    general: "navigation.subnav.settings.general",
    profile: "navigation.subnav.settings.profile",
  },
  adminContents: {
    topics: "navigation.subnav.admin.topics",
    listings: "navigation.subnav.admin.listings",
  },
};

type TranslateFn = (key: string) => string;

/** Translate a subsection tab label, falling back to the raw id if unmapped. */
export function getSubnavLabel(section: string, tabId: string, t: TranslateFn): string {
  const key = SUBNAV_KEYS[section]?.[tabId];
  return key ? t(key) : tabId;
}

/** Localized empty-state text for a feature feed. */
export function getEmptyStateText(feature: "feed", t: (key: string) => string): string {
  return t(`${feature}.empty`);
}

/** Localized error-state text for a feature feed. */
export function getErrorStateText(feature: "feed", t: (key: string) => string): string {
  return t(`${feature}.error`);
}

/**
 * Resolve localized entity name from `{ en: string; ar?: string }` or plain string.
 */
export function getLocalizedName(
  name: { en: string; ar?: string } | string | undefined | null,
  locale: string,
): string {
  if (!name) return "";
  if (typeof name === "string") return name;
  if (locale === "ar" && name.ar) return name.ar;
  return name.en || name.ar || "";
}
