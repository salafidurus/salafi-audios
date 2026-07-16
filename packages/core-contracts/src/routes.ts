/**
 * Canonical client-side route constants for the Salafi Durus platform.
 * All navigation references in apps and packages must use these instead
 * of hardcoded path strings.
 *
 * Access levels (see routeDefinitions below):
 *   public        — accessible to everyone, full content, no auth needed
 *   auth-optional — full UI for everyone; anonymous = local storage, authenticated = API
 *   auth-required — requires a signed-in session; redirects to sign-in if absent
 */
export const routes = {
  home: "/",
  search: "/search",

  explore: {
    index: "/explore",
    recent: "/explore/recent",
    following: "/explore/following",
  },

  library: {
    index: "/library",
    saved: "/library/saved",
    completed: "/library/completed",
  },

  settings: {
    index: "/settings",
    profile: "/settings/profile",
    legal: "/settings/legal",
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

  admin: {
    index: "/admin",
    stats: "/admin/stats",
    users: "/admin/users",
    contents: "/admin/contents",
    scholars: "/admin/scholars",
  },

  signIn: "/sign-in",
  support: "/support",
  privacy: "/privacy",
  termsOfUse: "/terms-of-use",
} as const;

/**
 * Access level for a route, consumed by the web proxy middleware and the
 * native route guard via {@link resolveRouteAccess}.
 *
 *   public        — full content for everyone, no sign-in needed
 *   auth-optional — UI renders for everyone; anonymous data lives in local
 *                   storage, authenticated data comes from the API and syncs
 *                   on sign-in. Never gate or redirect.
 *   auth-required — must be signed in; redirect to routes.signIn if not
 */
export type RouteAccess = "public" | "auth-optional" | "auth-required";

export interface RouteDefinition {
  path: string;
  access: RouteAccess;
}

/**
 * Canonical route-access registry — the single source of truth shared by web
 * and native. Order does not matter: resolution uses longest-prefix matching,
 * so a deeper path (e.g. /feed/following) overrides a shallower one (/feed).
 *
 * Mapping from the previous auth modes: public→public, local-first→auth-optional,
 * auth→auth-required. /feed/following and /account/profile are gated; the rest
 * preserve their prior semantics. Routes not listed fall back to "public".
 */
export const routeDefinitions: RouteDefinition[] = [
  { path: routes.explore.following, access: "auth-required" },
  { path: routes.explore.index, access: "public" },
  { path: routes.settings.profile, access: "auth-optional" },
  { path: routes.settings.legal, access: "public" },
  { path: routes.settings.index, access: "auth-optional" },
  { path: routes.library.index, access: "auth-optional" },
  { path: routes.search, access: "public" },
  { path: routes.scholars.index, access: "public" },
  { path: routes.support, access: "public" },
  { path: routes.admin.index, access: "auth-required" },
  { path: routes.home, access: "public" },
];

/**
 * Resolve the access level for a pathname using longest-prefix matching.
 * Trailing slashes are normalized; unknown paths fall back to "public".
 */
export function resolveRouteAccess(pathname: string): RouteAccess {
  // 1. Normalize trailing slash (keep root "/" intact)
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  // 2. Sort definitions by path length descending (longest-prefix matching)
  const sortedDefs = routeDefinitions.toSorted((a, b) => b.path.length - a.path.length);

  // 3. First exact or prefix match wins
  for (const def of sortedDefs) {
    if (normalizedPath === def.path || normalizedPath.startsWith(`${def.path}/`)) {
      return def.access;
    }
  }

  return "public";
}
