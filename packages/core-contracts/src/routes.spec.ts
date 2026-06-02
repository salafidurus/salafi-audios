import { routes, routeAuth, routeAuthOverrides } from "./routes";

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
/*  routeAuth tests                                                   */
/* ------------------------------------------------------------------ */

describe("routeAuth – coverage", () => {
  const topLevelKeys = Object.keys(routes);
  const authKeys = Object.keys(routeAuth);

  it("every top-level route section has an auth mode", () => {
    for (const key of topLevelKeys) {
      expect(authKeys).toContain(key);
    }
  });

  it("routeAuth contains only valid auth modes", () => {
    const validModes = new Set(["public", "local-first", "auth"]);
    for (const [key, mode] of Object.entries(routeAuth)) {
      expect({ key, valid: validModes.has(mode) }).toEqual(
        expect.objectContaining({ valid: true }),
      );
    }
  });

  it("routeAuth has no extra keys beyond routes", () => {
    for (const key of authKeys) {
      expect(topLevelKeys).toContain(key);
    }
  });
});

/* ------------------------------------------------------------------ */
/*  routeAuthOverrides tests                                          */
/* ------------------------------------------------------------------ */

describe("routeAuthOverrides – validity", () => {
  const allLeafValues = new Set(
    collectLeafStrings(routes as unknown as Record<string, unknown>).map((l) => l.value),
  );

  it("every override key is a valid leaf route path", () => {
    for (const key of Object.keys(routeAuthOverrides)) {
      expect({ key, isLeaf: allLeafValues.has(key) }).toEqual(
        expect.objectContaining({ isLeaf: true }),
      );
    }
  });

  it("override values are valid auth modes", () => {
    const validModes = new Set(["public", "local-first", "auth"]);
    for (const [key, mode] of Object.entries(routeAuthOverrides)) {
      expect({ key, valid: validModes.has(mode) }).toEqual(
        expect.objectContaining({ valid: true }),
      );
    }
  });
});
