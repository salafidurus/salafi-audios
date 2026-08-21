import type { RouteAccess } from "./routes";

import { routes, routeDefinitions, resolveRouteAccess } from "./routes";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const leafRoutes = [
  routes.home,
  routes.search,
  routes.explore.index,
  routes.explore.recent,
  routes.explore.scholar,
  routes.explore.curation,
  routes.library.index,
  routes.library.saved,
  routes.library.completed,
  routes.settings.index,
  routes.settings.profile,
  routes.settings.legal,
  routes.scholars.index,
  routes.admin.index,
  routes.admin.stats,
  routes.admin.users,
  routes.admin.contents,
  routes.admin.scholars,
  routes.signIn,
  routes.support,
  routes.privacy,
  routes.termsOfUse,
  routes.cookiePolicy,
] as const;

const VALID_ACCESS: ReadonlySet<RouteAccess> = new Set<RouteAccess>([
  "public",
  "auth-optional",
  "auth-required",
]);

/* ------------------------------------------------------------------ */
/*  Route structure tests                                             */
/* ------------------------------------------------------------------ */

describe("routes – structural integrity", () => {
  it("has at least one leaf route", () => {
    expect(leafRoutes.length).toBeGreaterThan(0);
  });

  it("every leaf string value starts with /", () => {
    for (const value of leafRoutes) {
      expect({ value, startsWithSlash: value.startsWith("/") }).toEqual(
        expect.objectContaining({ startsWithSlash: true }),
      );
    }
  });

  it("has no duplicate leaf string values", () => {
    const values = [...leafRoutes];
    const unique = new Set(values);
    const duplicates = values.filter((v, i) => values.indexOf(v) !== i);
    expect(duplicates).toEqual([]);
    expect(unique.size).toBe(values.length);
  });
});

/* ------------------------------------------------------------------ */
/*  routeDefinitions tests                                            */
/* ------------------------------------------------------------------ */

describe("routeDefinitions – validity", () => {
  it("every definition path starts with /", () => {
    for (const def of routeDefinitions) {
      expect({ path: def.path, ok: def.path.startsWith("/") }).toEqual(
        expect.objectContaining({ ok: true }),
      );
    }
  });

  it("every definition access is a valid RouteAccess", () => {
    for (const def of routeDefinitions) {
      expect({ path: def.path, valid: VALID_ACCESS.has(def.access) }).toEqual(
        expect.objectContaining({ valid: true }),
      );
    }
  });

  it("has no duplicate paths", () => {
    const paths = routeDefinitions.map((d) => d.path);
    const duplicates = paths.filter((p, i) => paths.indexOf(p) !== i);
    expect(duplicates).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  resolveRouteAccess tests                                          */
/* ------------------------------------------------------------------ */

describe("resolveRouteAccess", () => {
  it("matches the longest prefix, not a parent rule", () => {
    expect(resolveRouteAccess("/admin/users")).toBe("auth-required");
    expect(resolveRouteAccess("/admin")).toBe("auth-required");
    expect(resolveRouteAccess("/explore/scholar")).toBe("public");
  });

  it("normalizes a trailing slash", () => {
    expect(resolveRouteAccess("/settings/profile/")).toBe("auth-optional");
    expect(resolveRouteAccess("/settings/")).toBe("auth-optional");
  });

  it("matches nested sub-paths via prefix", () => {
    expect(resolveRouteAccess("/settings/profile/edit")).toBe("auth-optional");
    expect(resolveRouteAccess("/library/saved")).toBe("auth-optional");
    expect(resolveRouteAccess("/admin/users")).toBe("auth-required");
  });

  it("preserves local-first semantics as auth-optional", () => {
    expect(resolveRouteAccess("/settings")).toBe("auth-optional");
    expect(resolveRouteAccess("/library")).toBe("auth-optional");
  });

  it("honors the per-path public override under an auth-optional section", () => {
    expect(resolveRouteAccess("/settings/legal")).toBe("public");
  });

  it("treats the home route as public", () => {
    expect(resolveRouteAccess("/")).toBe("public");
  });

  it("falls back to public for unknown routes", () => {
    expect(resolveRouteAccess("/totally-unknown")).toBe("public");
    expect(resolveRouteAccess("/search")).toBe("public");
  });

  it("gates auth-required paths", () => {
    expect(resolveRouteAccess("/admin/dashboard")).toBe("auth-required");
    expect(resolveRouteAccess("/admin/scholars")).toBe("auth-required");
  });

  it("/settings/profile is auth-optional — shows AuthRequiredState, does not redirect", () => {
    expect(resolveRouteAccess("/settings/profile")).toBe("auth-optional");
  });
});
