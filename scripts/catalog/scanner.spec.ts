import { describe, it, expect, afterEach } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import {
  parseCatalogs,
  runCatalogCheck,
  runCatalogFix,
  getUnusedCatalogEntries,
  runCatalogPrune
} from "./scanner";

const TEMP_DIR = path.join(import.meta.dirname || "", "temp_test_monorepo");

function setupMockMonorepo(structure: {
  rootPackageJson: any;
  workspaces: Record<string, any>;
}) {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  
  // Write root package.json
  fs.writeFileSync(
    path.join(TEMP_DIR, "package.json"),
    JSON.stringify(structure.rootPackageJson, null, 2)
  );
  
  // Create workspaces
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

describe("catalog-scanner", () => {
  afterEach(() => {
    teardownMockMonorepo();
  });

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

  it("detects catalog references and hardcoded mismatches", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: {
            zod: "^4.4.3",
            typescript: "5.0.0"
          },
          catalogs: {
            frontend: {
              react: "19.0.0"
            }
          }
        }
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: {
            zod: "^4.4.3", // matches default catalog -> should be hardcoded warning
            react: "18.0.0", // mismatched from named catalog
            typescript: "catalog:" // correct usage
          }
        },
        "packages/core-db/package.json": {
          name: "@sd/core-db",
          dependencies: {
            zod: "catalog:", // correct usage
            pg: "^8.0.0" // duplicated outside catalog but not in catalog (see apps/api)
          }
        },
        "apps/api/package.json": {
          name: "@sd/api",
          dependencies: {
            pg: "^8.1.0" // duplicated outside catalog
          }
        }
      }
    });

    const { issues, duplicates } = runCatalogCheck(TEMP_DIR);

    // Verify issues
    const hardcodedZod = issues.find(i => i.depName === "zod" && i.type === "hardcoded");
    expect(hardcodedZod).toBeDefined();
    expect(hardcodedZod?.pkgName).toBe("@sd/web");
    expect(hardcodedZod?.details).toContain("@sd/web");

    // Verify duplicates outside catalog
    const pgDuplicate = duplicates.find(d => d.depName === "pg");
    expect(pgDuplicate).toBeDefined();
    expect(pgDuplicate?.workspaces).toContain("@sd/core-db");
    expect(pgDuplicate?.workspaces).toContain("@sd/api");
  });

  it("safely auto-fixes exact matches and ignores mismatches", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: {
            zod: "^4.4.3"
          },
          catalogs: {
            frontend: {
              react: "19.0.0"
            }
          }
        }
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: {
            zod: "^4.4.3", // exact match -> should fix to "catalog:"
            react: "19.0.0" // exact match -> should fix to "catalog:frontend"
          },
          devDependencies: {
            zod: "^3.0.0", // mismatch -> should NOT fix
            react: "18.0.0" // mismatch -> should NOT fix
          }
        }
      }
    });

    const { updatedFiles } = runCatalogFix(TEMP_DIR);
    expect(updatedFiles).toContain("@sd/web");

    // Read file back and assert
    const pkgContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "apps/web/package.json"), "utf-8")
    );

    // Exact matches must be updated
    expect(pkgContent.dependencies.zod).toBe("catalog:");
    expect(pkgContent.dependencies.react).toBe("catalog:frontend");

    // Mismatches must not be updated
    expect(pkgContent.devDependencies.zod).toBe("^3.0.0");
    expect(pkgContent.devDependencies.react).toBe("18.0.0");
  });

  it("finds and prunes unused catalog dependencies correctly", () => {
    setupMockMonorepo({
      rootPackageJson: {
        name: "root",
        workspaces: {
          packages: ["apps/*"],
          catalog: {
            zod: "^4.4.3",
            typescript: "5.0.0" // unused
          },
          catalogs: {
            frontend: {
              react: "19.0.0",
              lodash: "4.17.21" // unused
            }
          }
        }
      },
      workspaces: {
        "apps/web/package.json": {
          name: "@sd/web",
          dependencies: {
            zod: "catalog:",
            react: "catalog:frontend"
          }
        }
      }
    });

    // 1. Check unused
    const { unusedDefault, unusedNamed } = getUnusedCatalogEntries(TEMP_DIR);
    expect(unusedDefault).toContain("typescript");
    expect(unusedDefault).not.toContain("zod");
    expect(unusedNamed.frontend).toContain("lodash");
    expect(unusedNamed.frontend).not.toContain("react");

    // 2. Prune them
    const { prunedCount } = runCatalogPrune(TEMP_DIR);
    expect(prunedCount).toBe(2);

    // 3. Verify on disk
    const rootContent = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "package.json"), "utf-8")
    );
    expect(rootContent.workspaces.catalog.zod).toBeDefined();
    expect(rootContent.workspaces.catalog.typescript).toBeUndefined();
    expect(rootContent.workspaces.catalogs.frontend.react).toBeDefined();
    expect(rootContent.workspaces.catalogs.frontend.lodash).toBeUndefined();
  });
});
