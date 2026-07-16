import { describe, it, expect, afterEach } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import {
  parseCatalogs,
  runCatalogCheck,
  runCatalogFix,
  runCatalogFixForce,
  getUnusedCatalogEntries,
  runCatalogPrune,
  runCatalogStats,
  getDependencyGroup,
  loadConfig,
  sanitizeGroupName,
} from "../index";

const TEMP_DIR = path.join(import.meta.dirname || "", "temp_test_monorepo");

function setupMockMonorepo(structure: { rootPackageJson: any; workspaces: Record<string, any> }) {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(TEMP_DIR, "package.json"),
    JSON.stringify(structure.rootPackageJson, null, 2),
  );

  for (const [workspacePath, content] of Object.entries(structure.workspaces)) {
    const fullPath = path.join(TEMP_DIR, workspacePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(content, null, 2));
  }
}

function teardownMockMonorepo() {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}

function writeConfig(rootDir: string, config: any) {
  fs.writeFileSync(path.join(rootDir, "catalog.config.json"), JSON.stringify(config, null, 2));
}

describe("parseCatalogs", () => {
  afterEach(() => teardownMockMonorepo());

  it("parses default and named catalogs correctly", () => {
    const mockPackageJson = {
      name: "root",
      workspaces: {
        catalog: { zod: "^4.0.0" },
        catalogs: {
          frontend: { react: "19.0.0" },
        },
      },
    };
    const parsed = parseCatalogs(mockPackageJson as any);
    expect(parsed.default.zod).toBe("^4.0.0");
    expect(parsed.named.frontend.react).toBe("19.0.0");
  });
});

describe("sanitizeGroupName", () => {
  afterEach(() => teardownMockMonorepo());

  it("generates valid group names from dep name and version", () => {
    expect(sanitizeGroupName("react", "19.2.3")).toBe("react_19_2_3");
    expect(sanitizeGroupName("pg", "^8.0.0")).toBe("pg_8_0_0");
    expect(sanitizeGroupName("@types/node", "22.0.0")).toBe("@types/node_22_0_0".replace("/", "_"));
  });
});

describe("getDependencyGroup", () => {
  afterEach(() => teardownMockMonorepo());

  it("matches package and workspace globs correctly", () => {
    const mockConfig = {
      groups: [
        {
          name: "node_web",
          packages: ["@types/node"],
          workspaces: ["apps/web"],
        },
        {
          name: "react_native",
          packages: ["react", "react-dom"],
          workspaces: ["apps/native", "packages/core-*"],
        },
      ],
    };

    expect(getDependencyGroup("@types/node", "apps/web", mockConfig as any)).toBe("node_web");
    expect(getDependencyGroup("@types/node", "apps/native", mockConfig as any)).toBeNull();
    expect(getDependencyGroup("react", "apps/native", mockConfig as any)).toBe("react_native");
    expect(getDependencyGroup("react-dom", "packages/core-db", mockConfig as any)).toBe(
      "react_native",
    );
    expect(getDependencyGroup("react", "apps/web", mockConfig as any)).toBeNull();
    expect(getDependencyGroup("zod", "apps/web", mockConfig as any)).toBeNull();
  });
});

describe("loadConfig", () => {
  afterEach(() => teardownMockMonorepo());

  it("returns empty groups when no config file exists", () => {
    setupMockMonorepo({
      rootPackageJson: { name: "root", workspaces: { packages: ["packages/*"] } },
      workspaces: {},
    });
    const config = loadConfig(TEMP_DIR);
    expect(config.groups).toEqual([]);
  });

  it("returns parsed config when file exists", () => {
    setupMockMonorepo({
      rootPackageJson: { name: "root", workspaces: { packages: ["packages/*"] } },
      workspaces: {},
    });
    writeConfig(TEMP_DIR, {
      groups: [{ name: "g1", packages: ["react"], workspaces: ["apps/web"] }],
    });
    const config = loadConfig(TEMP_DIR);
    expect(config.groups).toHaveLength(1);
    expect(config.groups[0].name).toBe("g1");
  });
});

describe("runCatalogCheck", () => {
  afterEach(() => teardownMockMonorepo());

  it("finds hardcoded dep against default catalog", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: { react: "19.2.3" },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "19.2.3" },
        },
      },
    });

    const { issues } = runCatalogCheck(TEMP_DIR);
    const hardcoded = issues.find((i) => i.depName === "react" && i.type === "hardcoded");
    expect(hardcoded).toBeDefined();
    expect(hardcoded?.pkgName).toBe("@sd/web");
  });

  it("finds mismatch from default catalog", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: { react: "19.2.3" },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "18.0.0" },
        },
      },
    });

    const { issues } = runCatalogCheck(TEMP_DIR);
    const mismatch = issues.find((i) => i.depName === "react" && i.type === "mismatch");
    expect(mismatch).toBeDefined();
    expect(mismatch?.pkgName).toBe("@sd/web");
  });

  it("finds hardcoded dep against named catalog per group match", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalogs: { web_stuff: { react: "19.2.3" } },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "19.2.3" },
        },
      },
    });
    writeConfig(TEMP_DIR, {
      groups: [{ name: "web_stuff", packages: ["react"], workspaces: ["apps/web"] }],
    });

    const { issues } = runCatalogCheck(TEMP_DIR);
    const hardcoded = issues.find((i) => i.depName === "react" && i.type === "hardcoded");
    expect(hardcoded).toBeDefined();
    expect(hardcoded?.pkgName).toBe("@sd/web");
  });

  it("finds mismatch from named catalog per group match", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalogs: { web_stuff: { react: "19.2.3" } },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "18.0.0" },
        },
      },
    });
    writeConfig(TEMP_DIR, {
      groups: [{ name: "web_stuff", packages: ["react"], workspaces: ["apps/web"] }],
    });

    const { issues } = runCatalogCheck(TEMP_DIR);
    const mismatch = issues.find((i) => i.depName === "react" && i.type === "mismatch");
    expect(mismatch).toBeDefined();
    expect(mismatch?.pkgName).toBe("@sd/web");
  });

  it("finds missing catalog entry for catalog: ref", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: {},
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "catalog:" },
        },
      },
    });

    const { issues } = runCatalogCheck(TEMP_DIR);
    const missing = issues.find((i) => i.depName === "react" && i.type === "missing");
    expect(missing).toBeDefined();
    expect(missing?.pkgName).toBe("@sd/web");
  });

  it("finds duplicates outside catalog when no config groups", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: {},
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "19.2.3" },
        },
        "packages/core-db/package.json": {
          name: "@sd/core-db",
          dependencies: { react: "18.0.0" },
        },
      },
    });

    const { duplicates } = runCatalogCheck(TEMP_DIR);
    const dup = duplicates.find((d) => d.depName === "react");
    expect(dup).toBeDefined();
    expect(dup?.workspaces).toContain("@sd/web");
    expect(dup?.workspaces).toContain("@sd/core-db");
  });

  it("passes when everything is aligned", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: { react: "19.2.3" },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "catalog:" },
        },
        "packages/core-db/package.json": {
          name: "@sd/core-db",
          dependencies: { react: "catalog:" },
        },
      },
    });

    const { issues, duplicates } = runCatalogCheck(TEMP_DIR);
    expect(issues).toHaveLength(0);
    expect(duplicates).toHaveLength(0);
  });

  it("flags orphan: default catalog entry for dep used by <2 packages", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: { react: "19.2.3" },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "catalog:" },
        },
      },
    });

    const { issues } = runCatalogCheck(TEMP_DIR);
    const orphan = issues.find((i) => i.type === "orphan" && i.depName === "react");
    expect(orphan).toBeDefined();
    expect(orphan?.details).toContain("default catalog");
  });

  it("flags orphan: named catalog entry for dep used by <2 packages", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: {},
          catalogs: { web_stuff: { react: "19.2.3" } },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "catalog:web_stuff" },
        },
      },
    });

    const { issues } = runCatalogCheck(TEMP_DIR);
    const orphan = issues.find((i) => i.type === "orphan" && i.depName === "react");
    expect(orphan).toBeDefined();
    expect(orphan?.details).toContain("catalog:web_stuff");
  });

  it("no orphan when dep used by 2+ packages", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: { react: "19.2.3" },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "catalog:" },
        },
        "apps/native/package.json": {
          name: "@sd/native",
          dependencies: { react: "catalog:" },
        },
      },
    });

    const { issues } = runCatalogCheck(TEMP_DIR);
    const orphans = issues.filter((i) => i.type === "orphan" && i.depName === "react");
    expect(orphans).toHaveLength(0);
  });

  it("flags dangling ref: workspace uses catalog: for dep not in any catalog", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: {},
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { dangling: "catalog:" },
        },
        "apps/native/package.json": {
          name: "@sd/native",
          dependencies: { react: "^19.0.0" },
        },
      },
    });

    const { issues } = runCatalogCheck(TEMP_DIR);
    const dangling = issues.filter((i) => i.type === "missing" && i.depName === "dangling");
    expect(dangling).toHaveLength(1);
    expect(dangling[0].depName).toBe("dangling");
  });

  it("dangling ref with named catalog: workspace uses catalog:<group> but dep not in that group", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: {},
          catalogs: { frontend: {} },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { missing: "catalog:frontend" },
        },
        "apps/native/package.json": {
          name: "@sd/native",
          dependencies: {},
        },
      },
    });

    const { issues } = runCatalogCheck(TEMP_DIR);
    const dangling = issues.filter((i) => i.type === "missing" && i.depName === "missing");
    expect(dangling).toHaveLength(1);
    expect(dangling[0].depName).toBe("missing");
  });
});

describe("runCatalogFix (reality -> config)", () => {
  afterEach(() => teardownMockMonorepo());

  it("does not catalog dep used by only one workspace", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: {},
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "19.2.3" },
        },
        "apps/native/package.json": {
          name: "@sd/native",
          dependencies: { zod: "^4.0.0" },
        },
      },
    });

    const { updatedFiles } = runCatalogFix(TEMP_DIR);
    expect(updatedFiles).toHaveLength(0);

    const rootContent = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, "package.json"), "utf-8"));
    expect(Object.keys(rootContent.workspaces.catalog)).toHaveLength(0);

    const webContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "apps/web/package.json"), "utf-8"),
    );
    expect(webContent.dependencies.react).toBe("19.2.3");
  });

  it("force-aligns single-workspace dep with pre-existing catalog entry", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: { zod: "^4.4.3" },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { zod: "^4.4.3" },
        },
      },
    });

    const { updatedFiles } = runCatalogFix(TEMP_DIR);
    expect(updatedFiles).toContain("@sd/web");

    const webContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "apps/web/package.json"), "utf-8"),
    );
    expect(webContent.dependencies.zod).toBe("catalog:");
  });

  it("adds dep to default catalog when all workspaces use same version", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: {},
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "19.2.3", zod: "^4.0.0" },
        },
        "packages/core-db/package.json": {
          name: "@sd/core-db",
          dependencies: { react: "19.2.3" },
        },
      },
    });

    const { updatedFiles } = runCatalogFix(TEMP_DIR);
    expect(updatedFiles).toContain("@sd/web");
    expect(updatedFiles).toContain("@sd/core-db");

    const rootContent = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, "package.json"), "utf-8"));
    expect(rootContent.workspaces.catalog.react).toBe("19.2.3");

    const webContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "apps/web/package.json"), "utf-8"),
    );
    expect(webContent.dependencies.react).toBe("catalog:");

    const dbContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "packages/core-db/package.json"), "utf-8"),
    );
    expect(dbContent.dependencies.react).toBe("catalog:");
  });

  it("creates group when version conflict, canonical stays in default", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: {},
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "19.2.3" },
        },
        "packages/core-db/package.json": {
          name: "@sd/core-db",
          dependencies: { react: "18.0.0" },
        },
      },
    });

    writeConfig(TEMP_DIR, { groups: [] });

    const { updatedFiles } = runCatalogFix(TEMP_DIR);
    expect(updatedFiles).toContain("@sd/web");
    expect(updatedFiles).toContain("@sd/core-db");

    const rootContent = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, "package.json"), "utf-8"));
    expect(rootContent.workspaces.catalog.react).toBe("19.2.3");
    expect(rootContent.workspaces.catalogs.react_18_0_0.react).toBe("18.0.0");

    const configContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "catalog.config.json"), "utf-8"),
    );
    expect(configContent.groups).toContainEqual({
      name: "react_18_0_0",
      packages: ["react"],
      workspaces: ["packages/core-db"],
    });

    const webContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "apps/web/package.json"), "utf-8"),
    );
    expect(webContent.dependencies.react).toBe("catalog:");

    const dbContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "packages/core-db/package.json"), "utf-8"),
    );
    expect(dbContent.dependencies.react).toBe("catalog:react_18_0_0");
  });

  it("creates single group for multi-workspace same-version outliers", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: {},
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "19.2.3" },
        },
        "apps/native/package.json": {
          name: "@sd/native",
          dependencies: { react: "18.0.0" },
        },
        "packages/legacy/package.json": {
          name: "@sd/legacy",
          dependencies: { react: "18.0.0" },
        },
      },
    });

    writeConfig(TEMP_DIR, { groups: [] });

    const { updatedFiles } = runCatalogFix(TEMP_DIR);
    expect(updatedFiles).toContain("@sd/web");
    expect(updatedFiles).toContain("@sd/native");
    expect(updatedFiles).toContain("@sd/legacy");

    const configContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "catalog.config.json"), "utf-8"),
    );
    expect(configContent.groups).toContainEqual({
      name: "react_19_2_3",
      packages: ["react"],
      workspaces: ["apps/web"],
    });

    const rootContent = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, "package.json"), "utf-8"));
    expect(rootContent.workspaces.catalog.react).toBe("18.0.0");
    expect(rootContent.workspaces.catalogs.react_19_2_3.react).toBe("19.2.3");
  });

  it("reuses existing config groups and populates them", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: {},
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "19.2.3" },
        },
        "packages/core-db/package.json": {
          name: "@sd/core-db",
          dependencies: { react: "18.0.0" },
        },
      },
    });

    writeConfig(TEMP_DIR, {
      groups: [{ name: "web_stuff", packages: ["react"], workspaces: ["apps/web"] }],
    });

    const { updatedFiles } = runCatalogFix(TEMP_DIR);
    expect(updatedFiles).toContain("@sd/web");
    expect(updatedFiles).toContain("@sd/core-db");

    const rootContent = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, "package.json"), "utf-8"));
    expect(rootContent.workspaces.catalogs.web_stuff.react).toBe("19.2.3");
    expect(rootContent.workspaces.catalog.react).toBe("18.0.0");

    const configContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "catalog.config.json"), "utf-8"),
    );
    expect(configContent.groups).toHaveLength(1);

    const webContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "apps/web/package.json"), "utf-8"),
    );
    expect(webContent.dependencies.react).toBe("catalog:web_stuff");

    const dbContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "packages/core-db/package.json"), "utf-8"),
    );
    expect(dbContent.dependencies.react).toBe("catalog:");
  });

  it("no config file = flat mode (does not create config file)", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: {},
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "19.2.3" },
        },
        "packages/core-db/package.json": {
          name: "@sd/core-db",
          dependencies: { react: "19.2.3" },
        },
      },
    });

    const { updatedFiles } = runCatalogFix(TEMP_DIR);
    expect(updatedFiles).toContain("@sd/web");
    expect(updatedFiles).toContain("@sd/core-db");

    const configPath = path.join(TEMP_DIR, "catalog.config.json");
    expect(fs.existsSync(configPath)).toBe(false);
  });

  it("empty groups config + single version = flat default catalog", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: {},
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "19.2.3" },
        },
        "packages/core-db/package.json": {
          name: "@sd/core-db",
          dependencies: { react: "19.2.3" },
        },
      },
    });

    writeConfig(TEMP_DIR, { groups: [] });

    const { updatedFiles } = runCatalogFix(TEMP_DIR);
    expect(updatedFiles).toContain("@sd/web");
    expect(updatedFiles).toContain("@sd/core-db");

    const rootContent = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, "package.json"), "utf-8"));
    expect(rootContent.workspaces.catalog.react).toBe("19.2.3");

    const webContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "apps/web/package.json"), "utf-8"),
    );
    expect(webContent.dependencies.react).toBe("catalog:");

    const dbContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "packages/core-db/package.json"), "utf-8"),
    );
    expect(dbContent.dependencies.react).toBe("catalog:");
  });

  it("handles pg version conflict creating named group", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: {
            pg: "^8.17.2",
          },
        },
      },
      workspaces: {
        "packages/core-db/package.json": {
          name: "@sd/core-db",
          dependencies: {
            pg: "^8.0.0",
          },
        },
        "apps/api/package.json": {
          name: "@sd/api",
          dependencies: {
            pg: "^8.17.2",
          },
        },
      },
    });

    writeConfig(TEMP_DIR, { groups: [] });

    const { updatedFiles } = runCatalogFix(TEMP_DIR);
    expect(updatedFiles).toContain("@sd/core-db");
    expect(updatedFiles).toContain("@sd/api");

    const rootContent = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, "package.json"), "utf-8"));
    expect(rootContent.workspaces.catalog.pg).toBe("^8.17.2");
    expect(rootContent.workspaces.catalogs.pg_8_0_0.pg).toBe("^8.0.0");

    const configContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "catalog.config.json"), "utf-8"),
    );
    expect(configContent.groups).toContainEqual({
      name: "pg_8_0_0",
      packages: ["pg"],
      workspaces: ["packages/core-db"],
    });

    const apiContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "apps/api/package.json"), "utf-8"),
    );
    expect(apiContent.dependencies.pg).toBe("catalog:");

    const dbContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "packages/core-db/package.json"), "utf-8"),
    );
    expect(dbContent.dependencies.pg).toBe("catalog:pg_8_0_0");
  });

  it("removes orphan catalog entries not referenced by any workspace", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: { react: "^19.0.0", unused: "^1.0.0" },
          catalogs: { frontend: { next: "^15.0.0", stale: "^2.0.0" } },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "catalog:", next: "catalog:frontend" },
        },
        "apps/native/package.json": {
          name: "@sd/native",
          dependencies: { react: "catalog:" },
        },
      },
    });

    writeConfig(TEMP_DIR, {
      groups: [{ name: "frontend", packages: ["next"], workspaces: ["apps/web"] }],
    });

    const { updatedFiles } = runCatalogFix(TEMP_DIR);
    expect(updatedFiles).toContain("root");

    const rootContent = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, "package.json"), "utf-8"));
    expect(rootContent.workspaces.catalog.unused).toBeUndefined();
    expect(rootContent.workspaces.catalogs?.frontend).toBeUndefined();
    expect(rootContent.workspaces.catalog.react).toBeDefined();
  });

  it("cleans up empty named groups after orphan removal", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: {},
          catalogs: { ephemeral: { stale: "^1.0.0" } },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "^19.0.0" },
        },
        "apps/native/package.json": {
          name: "@sd/native",
          dependencies: { react: "^19.0.0" },
        },
      },
    });

    writeConfig(TEMP_DIR, { groups: [] });

    const { updatedFiles } = runCatalogFix(TEMP_DIR);
    expect(updatedFiles).toContain("root");

    const rootContent = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, "package.json"), "utf-8"));
    expect(rootContent.workspaces.catalogs.ephemeral).toBeUndefined();
  });

  it("reverts catalog: refs for orphaned deps when removing from catalog", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: { single: "^1.0.0" },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { single: "catalog:" },
        },
        "apps/native/package.json": {
          name: "@sd/native",
          dependencies: { react: "^19.0.0" },
        },
      },
    });

    const { updatedFiles } = runCatalogFix(TEMP_DIR);
    expect(updatedFiles).toContain("root");
    expect(updatedFiles).toContain("@sd/web");

    const rootContent = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, "package.json"), "utf-8"));
    expect(rootContent.workspaces.catalog.single).toBeUndefined();

    const webContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "apps/web/package.json"), "utf-8"),
    );
    expect(webContent.dependencies.single).toBe("^1.0.0");
  });
});

describe("runCatalogFixForce (config -> reality)", () => {
  afterEach(() => teardownMockMonorepo());

  it("enforces named group onto workspace", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalogs: { web_stuff: { react: "19.2.3" } },
          catalog: {},
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "18.0.0" },
        },
      },
    });
    writeConfig(TEMP_DIR, {
      groups: [{ name: "web_stuff", packages: ["react"], workspaces: ["apps/web"] }],
    });

    const { updatedFiles } = runCatalogFixForce(TEMP_DIR);
    expect(updatedFiles).toContain("@sd/web");

    const webContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "apps/web/package.json"), "utf-8"),
    );
    expect(webContent.dependencies.react).toBe("catalog:web_stuff");
  });

  it("enforces default catalog onto workspace", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: { react: "19.2.3" },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "18.0.0" },
        },
      },
    });

    const { updatedFiles } = runCatalogFixForce(TEMP_DIR);
    expect(updatedFiles).toContain("@sd/web");

    const webContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "apps/web/package.json"), "utf-8"),
    );
    expect(webContent.dependencies.react).toBe("catalog:");
  });

  it("skips workspace that does not match any group and dep not in any catalog", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalogs: { web_stuff: { react: "19.2.3" } },
          catalog: {},
        },
      },
      workspaces: {
        "apps/native/package.json": {
          name: "@sd/native",
          dependencies: { react: "19.2.3" },
        },
      },
    });
    writeConfig(TEMP_DIR, {
      groups: [{ name: "web_stuff", packages: ["react"], workspaces: ["apps/web"] }],
    });

    const { updatedFiles } = runCatalogFixForce(TEMP_DIR);
    expect(updatedFiles).not.toContain("@sd/native");

    const nativeContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "apps/native/package.json"), "utf-8"),
    );
    expect(nativeContent.dependencies.react).toBe("19.2.3");
  });

  it("uses named catalog for group match even when dep exists in default catalog too", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: { react: "19.2.3" },
          catalogs: { web_stuff: { react: "19.2.3" } },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "catalog:" },
        },
      },
    });
    writeConfig(TEMP_DIR, {
      groups: [{ name: "web_stuff", packages: ["react"], workspaces: ["apps/web"] }],
    });

    const { updatedFiles } = runCatalogFixForce(TEMP_DIR);
    expect(updatedFiles).toContain("@sd/web");

    const webContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "apps/web/package.json"), "utf-8"),
    );
    expect(webContent.dependencies.react).toBe("catalog:web_stuff");
  });
});

describe("getUnusedCatalogEntries / runCatalogPrune", () => {
  afterEach(() => teardownMockMonorepo());

  it("finds and prunes unused catalog entries", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: {
            zod: "^4.4.3",
            typescript: "5.0.0",
          },
          catalogs: {
            frontend: {
              react: "19.0.0",
              lodash: "4.17.21",
            },
          },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: {
            zod: "catalog:",
            react: "catalog:frontend",
          },
        },
      },
    });

    const { unusedDefault, unusedNamed } = getUnusedCatalogEntries(TEMP_DIR);
    expect(unusedDefault).toContain("typescript");
    expect(unusedDefault).not.toContain("zod");
    expect(unusedNamed.frontend).toContain("lodash");
    expect(unusedNamed.frontend).not.toContain("react");

    const { prunedCount } = runCatalogPrune(TEMP_DIR);
    expect(prunedCount).toBe(2);

    const rootContent = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, "package.json"), "utf-8"));
    expect(rootContent.workspaces.catalog.zod).toBeDefined();
    expect(rootContent.workspaces.catalog.typescript).toBeUndefined();
    expect(rootContent.workspaces.catalogs.frontend.react).toBeDefined();
    expect(rootContent.workspaces.catalogs.frontend.lodash).toBeUndefined();
  });
});

describe("runCatalogStats", () => {
  afterEach(() => teardownMockMonorepo());

  it("returns correct coverage and counts for a mixed setup", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: { zod: "^4.0.0" },
          catalogs: { web: { react: "19.2.3" } },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: {
            react: "catalog:web",
            zod: "catalog:",
            next: "15.0.0",
          },
        },
        "apps/native/package.json": {
          name: "@sd/native",
          dependencies: {
            react: "19.2.3",
            expo: "52.0.0",
          },
        },
      },
    });
    writeConfig(TEMP_DIR, {
      groups: [{ name: "web", packages: ["react"], workspaces: ["apps/web"] }],
    });

    const stats = runCatalogStats(TEMP_DIR);

    expect(stats.overview.totalWorkspaces).toBe(3);
    expect(stats.overview.uniqueExternalDeps).toBe(4);
    expect(stats.overview.eligibleDeps).toBe(1);
    expect(stats.overview.correctlyCataloged).toBe(1);
    expect(stats.overview.uncataloged).toBe(0);
    expect(stats.overview.miscatalogued).toBe(1);
    expect(stats.overview.coveragePercent).toBe(50);
    expect(stats.entries.default).toBe(1);
    expect(stats.entries.named).toHaveLength(1);
    expect(stats.entries.named[0].name).toBe("web");
    expect(stats.entries.named[0].entries).toBe(1);
  });

  it("lists catalog candidates (duplicated deps not yet cataloged)", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: {},
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { typescript: "5.0.0" },
        },
        "apps/native/package.json": {
          name: "@sd/native",
          dependencies: { typescript: "5.3.0" },
        },
      },
    });

    const stats = runCatalogStats(TEMP_DIR);
    expect(stats.candidates).toHaveLength(1);
    expect(stats.candidates[0].depName).toBe("typescript");
    expect(stats.candidates[0].groups).toHaveLength(2);
    const g5 = stats.candidates[0].groups.find((g) => g.version === "5.0.0");
    expect(g5?.workspaces).toContain("@sd/web");
    const g53 = stats.candidates[0].groups.find((g) => g.version === "5.3.0");
    expect(g53?.workspaces).toContain("@sd/native");
  });

  it("reports per-workspace breakdown correctly", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: { zod: "^4.0.0" },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: {
            zod: "catalog:",
            next: "15.0.0",
          },
        },
        "apps/native/package.json": {
          name: "@sd/native",
          dependencies: {
            expo: "52.0.0",
          },
        },
      },
    });

    const stats = runCatalogStats(TEMP_DIR);
    expect(stats.perWorkspace).toHaveLength(3);

    const web = stats.perWorkspace.find((w) => w.relativePath === "apps/web");
    expect(web).toBeDefined();
    expect(web!.totalDeps).toBe(1);
    expect(web!.catalogedEligible).toBe(0);
    expect(web!.percent).toBe(0);

    const native = stats.perWorkspace.find((w) => w.relativePath === "apps/native");
    expect(native).toBeDefined();
    expect(native!.totalDeps).toBe(0);
    expect(native!.catalogedEligible).toBe(0);
    expect(native!.percent).toBe(100);
  });

  it("returns 0% when everything is miscatalogued", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: { zod: "^4.0.0" },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { zod: "catalog:" },
        },
        "apps/native/package.json": {
          name: "@sd/native",
          dependencies: { expo: "52.0.0" },
        },
      },
    });

    const stats = runCatalogStats(TEMP_DIR);
    expect(stats.overview.eligibleDeps).toBe(0);
    expect(stats.overview.correctlyCataloged).toBe(0);
    expect(stats.overview.uncataloged).toBe(0);
    expect(stats.overview.miscatalogued).toBe(1);
    expect(stats.overview.coveragePercent).toBe(0);
  });

  it("returns 100% when everything is correctly cataloged", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: { react: "^19.0.0" },
        },
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: { react: "catalog:" },
        },
        "apps/native/package.json": {
          name: "@sd/native",
          dependencies: { react: "catalog:" },
        },
      },
    });

    const stats = runCatalogStats(TEMP_DIR);
    expect(stats.overview.eligibleDeps).toBe(1);
    expect(stats.overview.correctlyCataloged).toBe(1);
    expect(stats.overview.uncataloged).toBe(0);
    expect(stats.overview.miscatalogued).toBe(0);
    expect(stats.overview.coveragePercent).toBe(100);
  });
});
