import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { getTurboVersion, validateEnvironment } from "./turbo.mjs";
import fs from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

describe("turbo utility", () => {
  let tmpPath;

  beforeAll(() => {
    tmpPath = path.join(tmpdir(), `sd-deploy-test-${Date.now()}`);
    fs.mkdirSync(tmpPath, { recursive: true });
  });

  afterAll(() => {
    if (tmpPath && fs.existsSync(tmpPath)) {
      fs.rmSync(tmpPath, { recursive: true, force: true });
    }
  });

  it("extracts turbo version correctly from devDependencies", async () => {
    fs.writeFileSync(
      path.join(tmpPath, "package.json"),
      JSON.stringify({ devDependencies: { turbo: "^2.9.14" } }),
    );
    const version = await getTurboVersion(tmpPath);
    expect(version).toBe("2.9.14");
  });

  it("extracts turbo version correctly from dependencies with tilde", async () => {
    fs.writeFileSync(
      path.join(tmpPath, "package.json"),
      JSON.stringify({ dependencies: { turbo: "~3.0.1" } }),
    );
    const version = await getTurboVersion(tmpPath);
    expect(version).toBe("3.0.1");
  });

  it("returns null if turbo is missing in package.json", async () => {
    fs.writeFileSync(path.join(tmpPath, "package.json"), JSON.stringify({ devDependencies: {} }));
    const version = await getTurboVersion(tmpPath);
    expect(version).toBeNull();
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
