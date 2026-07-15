import { describe, it, expect } from "bun:test";
import { parseCatalogs } from "./catalog-scanner";

describe("catalog-scanner", () => {
  it("parses default and named catalogs correctly", () => {
    const mockPackageJson = {
      name: "root",
      workspaces: {
        catalog: { zod: "^4.0.0" },
        catalogs: {
          frontend: { react: "19.0.0" }
        }
      }
    };
    const parsed = parseCatalogs(mockPackageJson as any);
    expect(parsed.default.zod).toBe("^4.0.0");
    expect(parsed.named.frontend.react).toBe("19.0.0");
  });
});
