/**
 * Centralized, statically-extractable translation keys for navigation subnav
 * labels and feed/live state text. The literal-string maps below let
 * i18next-parser trace every key (dynamic `t(\`...${id}\`)` calls cannot be
 * parsed statically).
 */

import type { ScholarTitle } from "@sd/core-contracts";

export const SUBNAV_KEYS: Record<string, Record<string, string>> = {
  explore: {
    recent: "navigation.subnav.explore.recent",
    scholar: "navigation.subnav.explore.scholar",
    curation: "navigation.subnav.explore.curation",
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

export const SUBNAV_FALLBACKS: Record<string, Record<string, string>> = {
  explore: {
    recent: "Recent",
    scholar: "Scholars",
    curation: "Curation",
  },
  library: {
    started: "Started",
    saved: "Saved",
    completed: "Completed",
  },
  settings: {
    general: "General",
    profile: "Profile",
  },
  adminContents: {
    topics: "Topics",
    listings: "Listings",
  },
};

export type TranslateFn = (key: string, fallback?: string) => string;

/** Translate a subsection tab label, falling back to the default label or raw id if unmapped. */
export function getSubnavLabel(section: string, tabId: string, t: TranslateFn): string {
  const key = SUBNAV_KEYS[section]?.[tabId];
  const fallback = SUBNAV_FALLBACKS[section]?.[tabId] ?? tabId;
  return key ? t(key, fallback) : fallback;
}

export const SCHOLAR_TITLE_KEYS: Record<ScholarTitle, string> = {
  allamah: "scholar.title.allamah",
  sheikh: "scholar.title.sheikh",
  ustadh: "scholar.title.ustadh",
  akh: "scholar.title.akh",
};

/** Translate a scholar's honorific title, falling back to the raw value if unmapped. */
export function getScholarTitleLabel(
  title: ScholarTitle | string | undefined | null,
  t: TranslateFn,
): string {
  if (!title) return "";
  const key = SCHOLAR_TITLE_KEYS[title as ScholarTitle];
  return key ? t(key) : title;
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
 * Resolve localized entity name from `{ en?: string; ar?: string }` (either side
 * may be the required "main language" field — Listing/Scholar-adjacent entities
 * default to English required, Topic requires Arabic) or a plain string.
 */
export function getLocalizedName(
  name: { en?: string; ar?: string } | string | undefined | null,
  locale: string,
): string {
  if (!name) return "";
  if (typeof name === "string") return name;
  if (locale === "ar" && name.ar) return name.ar;
  return name.en || name.ar || "";
}
