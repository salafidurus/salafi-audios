import { describe, it, expect, mock } from "bun:test";
import { mkdtempSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

import { filterByGroups, dedupeCandidates, checkAll } from "./check";
import { config, type PkupdateConfig } from "./pkg-update.config";

mock.module("./utils/npm", () => ({
  fetchLatestVersion: mock((name: string) => {
    const versions: Record<string, string> = {
      zod: "4.4.3",
      bun: "1.3.14",
      expo: "57.0.6",
      "@nestjs/core": "11.2.0",
      prisma: "7.4.1",
    };
    return Promise.resolve(versions[name] ?? null);
  }),
}));

import { checkCatalog, checkBun, checkExpo } from "./check";

function createTempPkg(content: Record<string, unknown>): string {
  const dir = mkdtempSync(join(tmpdir(), "pkg-update-test-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify(content));
  return dir;
}

describe("filterByGroups", () => {
  const groups: PkupdateConfig["groups"] = {
    nestjs: { patterns: ["@nestjs/*"] },
    prisma: { patterns: ["prisma", "@prisma/*"] },
    vitest: { patterns: ["vitest", "@vitest/*"] },
  };

  it("matches @nestjs/core to nestjs group", () => {
    expect(filterByGroups("@nestjs/core", groups)).toBe("nestjs");
  });

  it("matches prisma to prisma group", () => {
    expect(filterByGroups("prisma", groups)).toBe("prisma");
  });

  it("matches @prisma/client to prisma group", () => {
    expect(filterByGroups("@prisma/client", groups)).toBe("prisma");
  });

  it("returns null for unmatched package", () => {
    expect(filterByGroups("zod", groups)).toBeNull();
  });
});

describe("dedupeCandidates", () => {
  it("keeps latest version per package", () => {
    const candidates = [
      {
        type: "catalog" as const,
        packageName: "zod",
        currentVersion: "3.0.0",
        latestVersion: "3.1.0",
      },
      {
        type: "catalog" as const,
        packageName: "zod",
        currentVersion: "3.0.0",
        latestVersion: "3.2.0",
      },
    ];
    const result = dedupeCandidates(candidates);
    expect(result).toHaveLength(1);
    expect(result[0]!.latestVersion).toBe("3.2.0");
  });

  it("keeps separate entries for different types", () => {
    const candidates = [
      {
        type: "catalog" as const,
        packageName: "bun",
        currentVersion: "1.0.0",
        latestVersion: "1.1.0",
      },
      { type: "bun" as const, packageName: "bun", currentVersion: "1.0.0", latestVersion: "1.2.0" },
    ];
    const result = dedupeCandidates(candidates);
    expect(result).toHaveLength(2);
  });

  it("returns empty array for no candidates", () => {
    expect(dedupeCandidates([])).toEqual([]);
  });
});

describe("checkCatalog", () => {
  const testConfig: PkupdateConfig = {
    groups: {},
    skip: ["react"],
    bun: { enabled: false },
    expo: { enabled: false },
  };

  it("returns empty when all packages up to date", async () => {
    const dir = createTempPkg({
      workspaces: { catalog: { zod: "^4.4.3" } },
    });
    const result = await checkCatalog(dir, testConfig);
    expect(result).toHaveLength(0);
  });

  it("skips packages in skip list", async () => {
    const dir = createTempPkg({
      workspaces: { catalog: { react: "19.0.0", zod: "^4.4.3" } },
    });
    const result = await checkCatalog(dir, testConfig);
    expect(result).toHaveLength(0);
  });

  it("returns candidates for outdated packages", async () => {
    const dir = createTempPkg({
      workspaces: { catalog: { zod: "1.0.0" } },
    });
    const result = await checkCatalog(dir, testConfig);
    expect(result).toHaveLength(1);
    expect(result[0]!.packageName).toBe("zod");
  });

  it("handles empty catalog", async () => {
    const dir = createTempPkg({ workspaces: { catalog: {} } });
    const result = await checkCatalog(dir, testConfig);
    expect(result).toHaveLength(0);
  });
});

describe("checkBun", () => {
  it("returns null when packageManager is missing", async () => {
    const dir = createTempPkg({ name: "test" });
    const result = await checkBun(dir);
    expect(result).toBeNull();
  });

  it("returns null when packageManager is not bun", async () => {
    const dir = createTempPkg({ packageManager: "npm@10.0.0" });
    const result = await checkBun(dir);
    expect(result).toBeNull();
  });

  it("returns null when bun is current", async () => {
    const dir = createTempPkg({ packageManager: "bun@1.3.14" });
    const result = await checkBun(dir);
    expect(result).toBeNull();
  });

  it("returns candidate when bun is outdated", async () => {
    const dir = createTempPkg({ packageManager: "bun@1.0.0" });
    const result = await checkBun(dir);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("bun");
    expect(result!.packageName).toBe("bun");
  });
});

describe("checkExpo", () => {
  it("returns null when native package.json missing", async () => {
    const dir = createTempPkg({ name: "test" });
    const result = await checkExpo(dir);
    expect(result).toBeNull();
  });

  it("returns null when expo dep missing", async () => {
    const dir = createTempPkg({ name: "test" });
    const nativeDir = join(dir, "apps", "native");
    mkdirSync(nativeDir, { recursive: true });
    writeFileSync(join(nativeDir, "package.json"), JSON.stringify({ name: "test" }));
    const result = await checkExpo(dir);
    expect(result).toBeNull();
  });

  it("returns null when expo is current", async () => {
    const dir = createTempPkg({ name: "test" });
    const nativeDir = join(dir, "apps", "native");
    mkdirSync(nativeDir, { recursive: true });
    writeFileSync(
      join(nativeDir, "package.json"),
      JSON.stringify({ dependencies: { expo: "~57.0.6" } }),
    );
    const result = await checkExpo(dir);
    expect(result).toBeNull();
  });

  it("returns candidate when expo is outdated", async () => {
    const dir = createTempPkg({ name: "test" });
    const nativeDir = join(dir, "apps", "native");
    mkdirSync(nativeDir, { recursive: true });
    writeFileSync(
      join(nativeDir, "package.json"),
      JSON.stringify({ dependencies: { expo: "~52.0.0" } }),
    );
    const result = await checkExpo(dir);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("expo");
  });
});

describe("checkAll", () => {
  it("returns results from catalog and bun checks", async () => {
    const dir = createTempPkg({
      name: "test",
      packageManager: "bun@1.0.0",
      workspaces: { catalog: { zod: "1.0.0" } },
    });
    const result = await checkAll(dir, config);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it("returns empty when everything current", async () => {
    const dir = createTempPkg({
      workspaces: { catalog: { zod: "^4.4.3" } },
    });
    const result = await checkAll(dir, {
      ...config,
      bun: { enabled: false },
      expo: { enabled: false },
    });
    expect(result).toHaveLength(0);
  });
});
