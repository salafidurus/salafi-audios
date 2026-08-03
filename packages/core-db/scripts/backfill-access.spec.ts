import { describe, expect, it } from "bun:test";

import { mapLegacyPermission, mapLegacyScholarRole } from "./backfill-access";

describe("backfill:access mappings", () => {
  it("does not turn legacy read permissions into grants", () => {
    expect(mapLegacyPermission("LISTINGS_VIEW")).toEqual([]);
    expect(mapLegacyPermission("SCHOLARS_EDIT")).toEqual([
      { target: "scholar", capability: "write", scholarId: null, locale: null },
    ]);
  });

  it("maps legacy scholar roles to separate aggregate capabilities", () => {
    expect(mapLegacyScholarRole("OWN_CONTENT", "scholar-a")).toEqual([
      { target: "scholar", capability: "write", scholarId: "scholar-a", locale: null },
      { target: "scholar", capability: "publish", scholarId: "scholar-a", locale: null },
      { target: "listing", capability: "write", scholarId: "scholar-a", locale: null },
      { target: "listing", capability: "publish", scholarId: "scholar-a", locale: null },
      { target: "media", capability: "write", scholarId: "scholar-a", locale: null },
    ]);
  });
});
