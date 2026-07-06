import { describe, it, expect } from "bun:test";
import { findMonorepoRoot } from "./paths.mjs";

describe("paths utility", () => {
  it("finds monorepo root correctly", () => {
    const root = findMonorepoRoot();
    expect(root).toBeDefined();
    expect(root).toContain("feat-deploy-script");
  });
});
