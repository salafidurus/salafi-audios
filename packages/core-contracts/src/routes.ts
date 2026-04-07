/**
 * Canonical route constants for the Salafi Durus platform.
 * All navigation references in apps and packages should use these
 * instead of hardcoded path strings.
 */
export const routes = {
  home: "/",
  search: "/search",
  feed: {
    root: "/feed",
    recent: "/feed/recent",
    following: "/feed/following",
  },
  library: {
    root: "/library",
    saved: "/library/saved",
    completed: "/library/completed",
  },
  live: {
    root: "/live",
    scheduled: "/live/scheduled",
    ended: "/live/ended",
  },
  account: {
    root: "/account",
    profile: "/account/profile",
    legal: "/account/legal",
  },
  signIn: "/sign-in",
  signUp: "/sign-up",
  support: "/support",
  privacy: "/privacy",
  termsOfUse: "/terms-of-use",
} as const;
