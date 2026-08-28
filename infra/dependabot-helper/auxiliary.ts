import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import {
  dependabotHelperPolicy,
  matchesDependencyFamily,
  type DependencyFamily,
} from "./policy";

interface PackageJson {
  workspaces?: { catalog?: Record<string, string> };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface HelperCheckResult {
  accepted: boolean;
  errors: string[];
}

function readCatalog(rootDir: string): Record<string, string> {
  const rootPackage = JSON.parse(
    readFileSync(resolve(rootDir, "package.json"), "utf8"),
  ) as PackageJson;
  return rootPackage.workspaces?.catalog ?? {};
}

function normalizeVersion(version: string): string {
  return version.replace(/^[\^~>=<]+\s*/, "");
}

function packageVersionMap(rootDir: string, family: DependencyFamily): Map<string, string> {
  const versions = new Map<string, string>();
  const catalog = readCatalog(rootDir);
  const workspaces = family.workspaces ?? ["apps/*", "packages/*"];

  const resolvedWorkspaces = workspaces.flatMap((workspace) => {
    if (!workspace.endsWith("/*")) return [workspace];
    const parent = resolve(rootDir, workspace.slice(0, -2));
    if (!existsSync(parent)) return [];
    return readdirSync(parent, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `${workspace.slice(0, -1)}${entry.name}`);
  });

  for (const workspace of resolvedWorkspaces) {
    const packagePath = resolve(rootDir, workspace, "package.json");
    if (!existsSync(packagePath)) continue;
    const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as PackageJson;
    for (const section of [pkg.dependencies, pkg.devDependencies, pkg.peerDependencies]) {
      for (const [name, version] of Object.entries(section ?? {})) {
        if (matchesDependencyFamily(family, name)) {
          const resolved = version === "catalog:" ? catalog[name] : version;
          if (resolved) versions.set(name, normalizeVersion(resolved));
        }
      }
    }
  }

  return versions;
}

/**
 * Checks helper-checked families without proposing or mutating dependencies.
 * A checked family is accepted only when every present member resolves to the
 * same normalized version.
 */
export function runHelperChecks(rootDir: string): HelperCheckResult {
  const errors: string[] = [];

  for (const family of dependabotHelperPolicy.families) {
    if (family.mode !== "helper-check" || family.checker !== "exact-version") continue;
    const versions = packageVersionMap(rootDir, family);
    const distinctVersions = [...new Set(versions.values())];
    if (distinctVersions.length > 1) {
      errors.push(
        `family '${family.name}' failed exact-version check: ${[...versions.entries()]
          .map(([name, version]) => `${name}=${version}`)
          .join(", ")}`,
      );
    }
  }

  return { accepted: errors.length === 0, errors };
}
