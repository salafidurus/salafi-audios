/**
 * Centralized, statically-extractable translation keys for navigation subnav
 * labels and feed/live state text. The literal-string maps below let
 * i18next-parser trace every key (dynamic `t(\`...${id}\`)` calls cannot be
 * parsed statically).
 */

import type { ScholarTitle } from "@sd/core-contracts";

/** Provides statically extractable translation keys and localized fallback helpers. */
/** Shared translation keys and semantic fallbacks for localized labels. */
export const SUBNAV_KEYS = {
  explore: {
    recent: "navigation.subnav.explore.recent",
    scholar: "navigation.subnav.explore.scholar",
    curation: "navigation.subnav.explore.curation",
  },
  myLibrary: {
    started: "navigation.subnav.myLibrary.started",
    saved: "navigation.subnav.myLibrary.saved",
    completed: "navigation.subnav.myLibrary.completed",
  },
  settings: {
    general: "navigation.subnav.settings.general",
    profile: "navigation.subnav.settings.profile",
  },
  adminContents: {
    topics: "navigation.subnav.admin.topics",
    listings: "navigation.subnav.admin.listings",
  },
} as const satisfies Record<string, Record<string, string>>;

/** English fallback labels retained for keys unavailable at runtime. */
export const SUBNAV_FALLBACKS = {
  explore: {
    recent: "Recent",
    scholar: "Scholars",
    curation: "Curation",
  },
  myLibrary: {
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
} as const satisfies Record<string, Record<string, string>>;

/** Minimal translation function shape required by these framework-neutral helpers. */
export type TranslateFn = (key: any, options?: any) => any;

type SubnavSection = keyof typeof SUBNAV_KEYS;
type LocalizedNameInput = { en?: string; ar?: string } | string | undefined | null;

function isSubnavSection(section: string): section is SubnavSection {
  return section in SUBNAV_KEYS;
}

function isScholarTitle(value: string): value is ScholarTitle {
  return value in SCHOLAR_TITLE_KEYS;
}

function isLocalizedNameRecord(value: LocalizedNameInput): value is { en?: string; ar?: string } {
  return Object.prototype.toString.call(value) === "[object Object]";
}

/** Translate a subsection tab label, falling back to the default label or raw id if unmapped. */
export function getSubnavLabel(section: string, tabId: string, t: TranslateFn): string {
  const key = isSubnavSection(section)
    ? Object.entries(SUBNAV_KEYS[section]).find(([candidate]) => candidate === tabId)?.[1]
    : undefined;
  const fallback = isSubnavSection(section)
    ? (Object.entries(SUBNAV_FALLBACKS[section]).find(([candidate]) => candidate === tabId)?.[1] ??
      tabId)
    : tabId;
  return key ? t(key, fallback) : fallback;
}

/** Maps canonical scholar titles to translation keys without changing title identity. */
export const SCHOLAR_TITLE_KEYS = {
  allamah: "scholar.title.allamah",
  sheikh: "scholar.title.sheikh",
  ustadh: "scholar.title.ustadh",
  akh: "scholar.title.akh",
} as const satisfies Record<ScholarTitle, string>;

/** Translate a scholar's honorific title, falling back to the raw value if unmapped. */
export function getScholarTitleLabel(
  title: ScholarTitle | string | undefined | null,
  t: TranslateFn,
): string {
  if (!title) return "";
  const key = isScholarTitle(title) ? SCHOLAR_TITLE_KEYS[title] : undefined;
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
export function getLocalizedName(name: LocalizedNameInput, locale: string): string {
  if (!name) return "";
  if (!isLocalizedNameRecord(name)) return name;
  if (locale === "ar" && name.ar) return name.ar;
  return name.en || name.ar || "";
}
