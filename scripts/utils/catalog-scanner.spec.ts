import { describe, it, expect, afterEach } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { parseCatalogs, runCatalogCheck } from "./catalog-scanner";

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

    // Verify duplicates outside catalog
    const pgDuplicate = duplicates.find(d => d.depName === "pg");
    expect(pgDuplicate).toBeDefined();
    expect(pgDuplicate?.workspaces).toContain("@sd/core-db");
    expect(pgDuplicate?.workspaces).toContain("@sd/api");
  });
});
