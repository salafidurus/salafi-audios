import { describe, it, expect } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { findMonorepoRoot } from "./paths.mjs";

describe("paths utility", () => {
  it("finds monorepo root correctly", () => {
    const root = findMonorepoRoot();
    expect(root).toBeDefined();
    expect(fs.existsSync(root)).toBe(true);
    expect(fs.existsSync(path.join(root, "package.json"))).toBe(true);
    expect(fs.existsSync(path.join(root, "turbo.json"))).toBe(true);
  });
});
