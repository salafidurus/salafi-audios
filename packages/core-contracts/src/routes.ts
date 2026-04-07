/**
 * Canonical client-side route constants for the Salafi Durus platform.
 * All navigation references in apps and packages must use these instead
 * of hardcoded path strings.
 *
 * Auth modes (see routeAuth below):
 *   public      — accessible to everyone, full content, no auth needed
 *   local-first — full UI for everyone; anonymous = local storage, authenticated = API
 *   auth        — requires a signed-in session; redirects to sign-in if absent
 */
export const routes = {
  home: "/",
  search: "/search",

  feed: {
    index: "/feed",
    recent: "/feed/recent",
    following: "/feed/following",
  },

  library: {
    index: "/library",
    saved: "/library/saved",
    completed: "/library/completed",
  },

  live: {
    index: "/live",
  },

  account: {
    index: "/account",
    profile: "/account/profile",
    legal: "/account/legal",
  },

  scholars: {
    index: "/scholars",
    detail: (slug: string) => `/scholars/${slug}` as const,
  },

  collections: {
    detail: (id: string) => `/collections/${id}` as const,
  },

  series: {
    detail: (id: string) => `/series/${id}` as const,
  },

  lectures: {
    detail: (id: string) => `/lectures/${id}` as const,
  },

  signIn: "/sign-in",
  signUp: "/sign-up",
  support: "/support",
  privacy: "/privacy",
  termsOfUse: "/terms-of-use",
} as const;

/**
 * Auth mode for each route section.
 *
 *   public      — full content for everyone, no sign-in needed
 *   local-first — UI renders for everyone; anonymous data lives in local
 *                 storage, authenticated data comes from the API and syncs
 *                 on sign-in. Never gate or redirect.
 *   auth        — must be signed in; redirect to routes.signIn if not
 */
export type RouteAuthMode = "public" | "local-first" | "auth";

export const routeAuth = {
  home: "public",
  search: "public",
  feed: "public",
  live: "public",
  scholars: "public",
  collections: "public",
  series: "public",
  lectures: "public",
  support: "public",
  privacy: "public",
  termsOfUse: "public",
  signIn: "public",
  signUp: "public",
  library: "local-first",
  account: "auth",
} as const satisfies Record<keyof typeof routes, RouteAuthMode>;
