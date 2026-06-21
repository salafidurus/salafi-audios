import { routes, routeDefinitions, resolveRouteAccess } from "./routes";
import type { RouteAccess } from "./routes";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Recursively collect all leaf string values from a nested object. */
function collectLeafStrings(
  obj: Record<string, unknown>,
  path = "",
): { path: string; value: string }[] {
  const results: { path: string; value: string }[] = [];
  for (const [key, val] of Object.entries(obj)) {
    const fullPath = path ? `${path}.${key}` : key;
    if (typeof val === "string") {
      results.push({ path: fullPath, value: val });
    } else if (typeof val === "object" && val !== null && typeof val !== "function") {
      results.push(...collectLeafStrings(val as Record<string, unknown>, fullPath));
    }
    // Skip functions (dynamic route builders like detail(id))
  }
  return results;
}

const VALID_ACCESS: ReadonlySet<RouteAccess> = new Set<RouteAccess>([
  "public",
  "auth-optional",
  "auth-required",
]);

/* ------------------------------------------------------------------ */
/*  Route structure tests                                             */
/* ------------------------------------------------------------------ */

describe("routes – structural integrity", () => {
  const leaves = collectLeafStrings(routes as unknown as Record<string, unknown>);

  it("has at least one leaf route", () => {
    expect(leaves.length).toBeGreaterThan(0);
  });

  it("every leaf string value starts with /", () => {
    for (const { path, value } of leaves) {
      expect({ path, value, startsWithSlash: value.startsWith("/") }).toEqual(
        expect.objectContaining({ startsWithSlash: true }),
      );
    }
  });

  it("has no duplicate leaf string values", () => {
    const values = leaves.map((l) => l.value);
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
    expect(resolveRouteAccess("/feed/following")).toBe("auth-required");
    expect(resolveRouteAccess("/feed")).toBe("public");
    expect(resolveRouteAccess("/feed/recent")).toBe("public");
  });

  it("normalizes a trailing slash", () => {
    expect(resolveRouteAccess("/account/profile/")).toBe("auth-required");
    expect(resolveRouteAccess("/account/")).toBe("auth-optional");
  });

  it("matches nested sub-paths via prefix", () => {
    expect(resolveRouteAccess("/account/profile/edit")).toBe("auth-required");
    expect(resolveRouteAccess("/live/session-123")).toBe("public");
    expect(resolveRouteAccess("/library/saved")).toBe("auth-optional");
    expect(resolveRouteAccess("/admin/users")).toBe("auth-required");
  });

  it("preserves local-first semantics as auth-optional", () => {
    expect(resolveRouteAccess("/account")).toBe("auth-optional");
    expect(resolveRouteAccess("/library")).toBe("auth-optional");
  });

  it("honors the per-path public override under an auth-optional section", () => {
    expect(resolveRouteAccess("/account/legal")).toBe("public");
  });

  it("treats the home route as public", () => {
    expect(resolveRouteAccess("/")).toBe("public");
  });

  it("falls back to public for unknown routes", () => {
    expect(resolveRouteAccess("/totally-unknown")).toBe("public");
    expect(resolveRouteAccess("/search")).toBe("public");
  });

  it("gates the newly protected leaves", () => {
    expect(resolveRouteAccess("/feed/following")).toBe("auth-required");
    expect(resolveRouteAccess("/account/profile")).toBe("auth-required");
    expect(resolveRouteAccess("/admin")).toBe("auth-required");
  });
});
