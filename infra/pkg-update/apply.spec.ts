import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

import { updateCatalogEntry, applyCatalogUpdate, applyBunUpdate } from "./apply";
import type { UpdateCandidate } from "./utils/ui";

let tmpDir: string;

beforeAll(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "pkg-update-apply-test-"));
  writeFileSync(
    join(tmpDir, "package.json"),
    JSON.stringify({
      name: "test-monorepo",
      packageManager: "bun@1.2.5",
      workspaces: {
        packages: ["apps/*", "packages/*"],
        catalog: { zod: "^4.4.3", "@nestjs/core": "^11.0.0" },
      },
      devDependencies: { "bun-types": "^1.2.0" },
    }),
  );
  const nativeDir = join(tmpDir, "apps", "native");
  mkdirSync(nativeDir, { recursive: true });
  writeFileSync(
    join(nativeDir, "package.json"),
    JSON.stringify({ name: "native", dependencies: { expo: "~52.0.0" } }),
  );
});

afterAll(() => {
  // Clean up
  const { rmSync } = require("fs") as typeof import("fs");
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("updateCatalogEntry", () => {
  it("updates an existing catalog entry in parsed JSON", () => {
    const pkg = {
      workspaces: { catalog: { zod: "^3.0.0" } },
    };
    const result = updateCatalogEntry(pkg as any, "zod", "^4.0.0");
    expect((result.workspaces as any).catalog.zod).toBe("^4.0.0");
  });

  it("throws for unknown package", () => {
    const pkg = { workspaces: { catalog: {} } };
    expect(() => updateCatalogEntry(pkg as any, "nonexistent", "1.0.0")).toThrow(
      'Package "nonexistent" not found in catalog',
    );
  });
});

describe("applyCatalogUpdate", () => {
  it("writes updated version to root package.json", async () => {
    const candidate: UpdateCandidate = {
      type: "catalog",
      packageName: "zod",
      currentVersion: "^4.4.3",
      latestVersion: "5.0.0",
    };
    await applyCatalogUpdate(candidate, tmpDir);

    const content = JSON.parse(readFileSync(join(tmpDir, "package.json"), "utf-8"));
    expect(content.workspaces.catalog.zod).toBe("5.0.0");
  });
});

describe("applyBunUpdate", () => {
  it("updates packageManager and bun-types", async () => {
    const candidate: UpdateCandidate = {
      type: "bun",
      packageName: "bun",
      currentVersion: "bun@1.2.5",
      latestVersion: "bun@1.3.0",
    };
    await applyBunUpdate(candidate, tmpDir);

    const content = JSON.parse(readFileSync(join(tmpDir, "package.json"), "utf-8"));
    expect(content.packageManager).toBe("bun@1.3.0");
    expect(content.devDependencies["bun-types"]).toBe("^1.3.0");
  });
});
