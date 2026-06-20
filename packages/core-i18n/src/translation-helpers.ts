/**
 * Centralized, statically-extractable translation keys for navigation subnav
 * labels and feed/live state text. The literal-string maps below let
 * i18next-parser trace every key (dynamic `t(\`...${id}\`)` calls cannot be
 * parsed statically).
 */

export const SUBNAV_KEYS: Record<string, Record<string, string>> = {
  feed: {
    popular: "navigation.subnav.feed.popular",
    recent: "navigation.subnav.feed.recent",
    following: "navigation.subnav.feed.following",
  },
  live: {
    ongoing: "navigation.subnav.live.ongoing",
    scheduled: "navigation.subnav.live.scheduled",
    ended: "navigation.subnav.live.ended",
  },
  library: {
    started: "navigation.subnav.library.started",
    saved: "navigation.subnav.library.saved",
    completed: "navigation.subnav.library.completed",
  },
  account: {
    general: "navigation.subnav.account.general",
    profile: "navigation.subnav.account.profile",
    legal: "navigation.subnav.account.legal",
  },
};

type TranslateFn = (key: string) => string;

/** Translate a subsection tab label, falling back to the raw id if unmapped. */
export function getSubnavLabel(section: string, tabId: string, t: TranslateFn): string {
  const key = SUBNAV_KEYS[section]?.[tabId];
  return key ? t(key) : tabId;
}

/** Localized empty-state text for a feature feed (feed/live). */
export function getEmptyStateText(feature: "feed" | "live", t: (key: string) => string): string {
  return t(`${feature}.empty`);
}

/** Localized error-state text for a feature feed (feed/live). */
export function getErrorStateText(feature: "feed" | "live", t: (key: string) => string): string {
  return t(`${feature}.error`);
}
