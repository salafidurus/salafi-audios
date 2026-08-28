import { describe, expect, it } from "bun:test";
import fs, { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { runCatalogAlignment } from "./catalog-alignment";

function fixture() {
  const rootDir = mkdtempSync(path.join(tmpdir(), "dependabot-helper-catalog-"));
  fs.mkdirSync(path.join(rootDir, "apps/web"), { recursive: true });
  fs.writeFileSync(
    path.join(rootDir, "package.json"),
    JSON.stringify({
      name: "root",
      workspaces: { packages: ["apps/*"], catalog: {} },
    }),
  );
  fs.writeFileSync(
    path.join(rootDir, "apps/web/package.json"),
    JSON.stringify({ name: "web", dependencies: { zod: "^4.0.0" } }),
  );
  fs.mkdirSync(path.join(rootDir, "apps/api"), { recursive: true });
  fs.writeFileSync(
    path.join(rootDir, "apps/api/package.json"),
    JSON.stringify({ name: "api", dependencies: { zod: "^4.0.0" } }),
  );
  return rootDir;
}

describe("Dependabot Helper catalog alignment boundary", () => {
  it("normalizes an authorized dependency and reports its mutations", () => {
    const rootDir = fixture();

    const result = runCatalogAlignment({
      rootDir,
      authorizedDependencies: ["zod"],
    });

    expect(result.report.status).toBe("applied");
    expect(result.report.mutations.some((mutation) => mutation.dependency === "zod")).toBe(true);
    expect(
      JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8")).workspaces.catalog
        .zod,
    ).toBe("^4.0.0");
  });

  it("rejects an out-of-scope mutation without writing files", () => {
    const rootDir = fixture();
    const before = fs.readFileSync(path.join(rootDir, "package.json"), "utf8");

    const result = runCatalogAlignment({
      rootDir,
      authorizedDependencies: ["react"],
    });

    expect(result.report.status).toBe("rejected");
    expect(result.report.reason).toMatch(/outside the authorized dependency scope/);
    expect(fs.readFileSync(path.join(rootDir, "package.json"), "utf8")).toBe(before);
  });

  it("does not read the legacy catalog policy file", () => {
    const rootDir = fixture();
    fs.writeFileSync(path.join(rootDir, "catalog.config.json"), "not json");

    expect(() => runCatalogAlignment({ rootDir, authorizedDependencies: ["zod"] })).not.toThrow();
  });

  it("rejects and rolls back when lockfile validation fails", () => {
    const rootDir = fixture();
    const before = fs.readFileSync(path.join(rootDir, "package.json"), "utf8");

    const result = runCatalogAlignment({
      rootDir,
      authorizedDependencies: ["zod"],
      validateLockfile: true,
      install: () => ({ status: 1, stderr: "lockfile mismatch" }),
    });

    expect(result.report.status).toBe("rejected");
    expect(result.report.reason).toContain("lockfile mismatch");
    expect(fs.readFileSync(path.join(rootDir, "package.json"), "utf8")).toBe(before);
  });
});
