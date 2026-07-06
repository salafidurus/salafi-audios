import { describe, it, expect } from "bun:test";
import { getTurboVersion, validateEnvironment } from "./turbo.mjs";
import { findMonorepoRoot } from "./paths.mjs";

describe("turbo utility", () => {
  it("extracts turbo version correctly from package.json", async () => {
    const root = findMonorepoRoot();
    const version = await getTurboVersion(root);
    expect(version).toBe("2.9.14");
  });

  it("validates environment without errors when bun/bunx are in path", () => {
    expect(() => validateEnvironment()).not.toThrow();
  });

  it("throws error in validateEnvironment when bun or bunx is not present", () => {
    const originalWhich = Bun.which;
    try {
      // Mock Bun.which to simulate missing CLIs
      Bun.which = () => null;
      expect(() => validateEnvironment()).toThrow();
    } finally {
      // Restore original Bun.which
      Bun.which = originalWhich;
    }
  });
});
