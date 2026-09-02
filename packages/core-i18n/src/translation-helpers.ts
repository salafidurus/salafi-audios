import type { ScholarTitle } from "@sd/core-contracts";

/**
 * Minimal translation callback accepted by framework-neutral localization
 * helpers; callers provide a key and may provide interpolation options.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the callback contract is documented above.
export type TranslateFn = (key: any, options?: any) => any;

type LocalizedNameInput = { en?: string; ar?: string } | string | undefined | null;

function isScholarTitle(value: string): value is ScholarTitle {
  return value in SCHOLAR_TITLE_KEYS;
}

function isLocalizedNameRecord(value: LocalizedNameInput): value is { en?: string; ar?: string } {
  return Object.prototype.toString.call(value) === "[object Object]";
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
