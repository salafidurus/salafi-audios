import { describe, it, expect, beforeAll, afterAll, mock } from "bun:test";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

import {
  updateCatalogEntry,
  applyCatalogUpdate,
  applyBunUpdate,
  applyExpoUpdate,
  findWorkspacePkgFiles,
  syncWorkspaceDeps,
} from "./apply";
import { config, type PkupdateConfig } from "./pkg-update.config";
import type { UpdateCandidate } from "./utils/ui";

mock.module("child_process", () => ({
  spawnSync: () => ({ status: 0, stdout: "", stderr: "" }),
}));

let tmpDir: string;

beforeAll(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "pkg-update-apply-test-"));
  writeFileSync(
    join(tmpDir, "package.json"),
    JSON.stringify({
      name: "test-monorepo",
      packageManager: "bun@1.2.5",
      engines: { bun: "1.2.5" },
      workspaces: {
        packages: ["apps/*", "packages/*"],
        catalog: {
          zod: "^4.4.3",
          "@nestjs/core": "^11.0.0",
          "better-auth": "1.6.18",
          "@better-auth/expo": "1.6.18",
        },
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
  const apiDir = join(tmpDir, "apps", "api");
  mkdirSync(apiDir, { recursive: true });
  writeFileSync(
    join(apiDir, "package.json"),
    JSON.stringify({
      name: "api",
      dependencies: { zod: "^4.4.3", "better-auth": "1.6.18", "@better-auth/expo": "1.6.18" },
    }),
  );
  const webDir = join(tmpDir, "apps", "web");
  mkdirSync(webDir, { recursive: true });
  writeFileSync(
    join(webDir, "package.json"),
    JSON.stringify({
      name: "web",
      dependencies: { zod: "4.4.3", react: "19.0.0" },
    }),
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

  it("preserves caret prefix from catalog entry", () => {
    const pkg = {
      workspaces: { catalog: { zod: "^3.0.0" } },
    };
    const result = updateCatalogEntry(pkg as any, "zod", "4.0.0");
    expect((result.workspaces as any).catalog.zod).toBe("^4.0.0");
  });

  it("preserves tilde prefix from catalog entry", () => {
    const pkg = {
      workspaces: { catalog: { zod: "~3.0.0" } },
    };
    const result = updateCatalogEntry(pkg as any, "zod", "4.0.0");
    expect((result.workspaces as any).catalog.zod).toBe("~4.0.0");
  });

  it("handles version without prefix", () => {
    const pkg = {
      workspaces: { catalog: { zod: "3.0.0" } },
    };
    const result = updateCatalogEntry(pkg as any, "zod", "4.0.0");
    expect((result.workspaces as any).catalog.zod).toBe("4.0.0");
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
    await applyCatalogUpdate(candidate, tmpDir, config);

    const content = JSON.parse(readFileSync(join(tmpDir, "package.json"), "utf-8"));
    expect(content.workspaces.catalog.zod).toBe("^5.0.0");
  });

  it("syncs version-locked group members in catalog", async () => {
    const candidate: UpdateCandidate = {
      type: "catalog",
      packageName: "better-auth",
      currentVersion: "1.6.18",
      latestVersion: "1.6.23",
    };
    await applyCatalogUpdate(candidate, tmpDir, config);

    const content = JSON.parse(readFileSync(join(tmpDir, "package.json"), "utf-8"));
    expect(content.workspaces.catalog["better-auth"]).toBe("1.6.23");
    expect(content.workspaces.catalog["@better-auth/expo"]).toBe("1.6.23");

    const apiPkg = JSON.parse(readFileSync(join(tmpDir, "apps", "api", "package.json"), "utf-8"));
    expect(apiPkg.dependencies["better-auth"]).toBe("1.6.23");
    expect(apiPkg.dependencies["@better-auth/expo"]).toBe("1.6.23");
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
    expect(content.engines.bun).toBe("1.3.0");
  });

  it("writes .bun-version file", async () => {
    const candidate: UpdateCandidate = {
      type: "bun",
      packageName: "bun",
      currentVersion: "bun@1.2.5",
      latestVersion: "bun@1.3.14",
    };
    await applyBunUpdate(candidate, tmpDir);

    const bunVersion = readFileSync(join(tmpDir, ".bun-version"), "utf-8").trim();
    expect(bunVersion).toBe("1.3.14");
  });
});

describe("applyExpoUpdate", () => {
  it("bumps expo version in native package.json before running expo install --fix", async () => {
    const candidate: UpdateCandidate = {
      type: "expo",
      packageName: "expo",
      currentVersion: "~52.0.0",
      latestVersion: "57.0.6",
    };

    await applyExpoUpdate(candidate, tmpDir);

    const nativePkg = JSON.parse(
      readFileSync(join(tmpDir, "apps", "native", "package.json"), "utf-8"),
    );
    expect(nativePkg.dependencies.expo).toBe("57.0.6");
  });
});

describe("findWorkspacePkgFiles", () => {
  it("finds workspace package.json files", () => {
    const files = findWorkspacePkgFiles(tmpDir);
    expect(files).toContain(join(tmpDir, "apps", "native", "package.json"));
    expect(files).toContain(join(tmpDir, "apps", "api", "package.json"));
    expect(files).toContain(join(tmpDir, "apps", "web", "package.json"));
    expect(files).not.toContain(join(tmpDir, "package.json"));
  });
});

describe("syncWorkspaceDeps", () => {
  it("updates matching dep across workspace files", () => {
    const candidate: UpdateCandidate = {
      type: "catalog",
      packageName: "zod",
      currentVersion: "^4.4.3",
      latestVersion: "5.0.0",
    };
    const updated = syncWorkspaceDeps(candidate, tmpDir, config);

    const apiPkg = JSON.parse(readFileSync(join(tmpDir, "apps", "api", "package.json"), "utf-8"));
    expect(apiPkg.dependencies.zod).toBe("^5.0.0");
    expect(updated.length).toBeGreaterThanOrEqual(1);
  });

  it("uses catalog prefix for workspace deps", () => {
    const candidate: UpdateCandidate = {
      type: "catalog",
      packageName: "zod",
      currentVersion: "4.4.3",
      latestVersion: "5.0.0",
    };
    syncWorkspaceDeps(candidate, tmpDir, config);

    const webPkg = JSON.parse(readFileSync(join(tmpDir, "apps", "web", "package.json"), "utf-8"));
    expect(webPkg.dependencies.zod).toBe("^5.0.0");
  });

  it("updates version-locked group members in workspace files", () => {
    const candidate: UpdateCandidate = {
      type: "catalog",
      packageName: "better-auth",
      currentVersion: "1.6.18",
      latestVersion: "1.6.23",
    };
    const updated = syncWorkspaceDeps(candidate, tmpDir, config);

    const apiPkg = JSON.parse(readFileSync(join(tmpDir, "apps", "api", "package.json"), "utf-8"));
    expect(apiPkg.dependencies["better-auth"]).toBe("1.6.23");
    expect(apiPkg.dependencies["@better-auth/expo"]).toBe("1.6.23");
    expect(updated.length).toBeGreaterThanOrEqual(1);
  });

  it("does not update packages in expo group", () => {
    const webPkg = JSON.parse(readFileSync(join(tmpDir, "apps", "web", "package.json"), "utf-8"));
    const oldReact = webPkg.dependencies.react;

    const candidate: UpdateCandidate = {
      type: "catalog",
      packageName: "react",
      currentVersion: "19.0.0",
      latestVersion: "20.0.0",
    };
    syncWorkspaceDeps(candidate, tmpDir, config);

    const updated = JSON.parse(readFileSync(join(tmpDir, "apps", "web", "package.json"), "utf-8"));
    expect(updated.dependencies.react).toBe(oldReact);
  });

  it("updates packages in never list (each gets own PR)", () => {
    const candidate: UpdateCandidate = {
      type: "catalog",
      packageName: "typescript",
      currentVersion: "5.9.3",
      latestVersion: "6.0.0",
    };
    const updated = syncWorkspaceDeps(candidate, tmpDir, config);
    expect(Array.isArray(updated)).toBe(true);
  });

  it("preserves catalog: protocol references in workspace deps", () => {
    const candidate: UpdateCandidate = {
      type: "catalog",
      packageName: "zod",
      currentVersion: "^4.4.3",
      latestVersion: "5.0.0",
    };
    const apiPkgPath = join(tmpDir, "apps", "api", "package.json");
    const apiPkg = JSON.parse(readFileSync(apiPkgPath, "utf-8"));
    apiPkg.dependencies.zod = "catalog:";
    writeFileSync(apiPkgPath, JSON.stringify(apiPkg, null, 2) + "\n");

    const updated = syncWorkspaceDeps(candidate, tmpDir, config);

    const result = JSON.parse(readFileSync(apiPkgPath, "utf-8"));
    expect(result.dependencies.zod).toBe("catalog:");
    expect(updated.filter((f) => f === apiPkgPath)).toHaveLength(0);
  });
});
