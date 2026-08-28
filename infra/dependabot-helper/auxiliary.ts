import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import type { CiOptions, CiSummary } from "./updates/ci";

import {
  dependabotHelperPolicy,
  matchesDependencyFamily,
  validatePolicy,
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

/** Validates Helper policy against the repository's native Dependabot ignores. */
export function validateHelperPolicy(rootDir: string): string[] {
  const source = readFileSync(resolve(rootDir, ".github/dependabot.yml"), "utf8");
  const ignored = Array.from(
    source.matchAll(/^\s*-\s*dependency-name:\s*["']?([^"'\s]+)["']?\s*$/gm),
    (match) => match[1]!,
  );
  return validatePolicy(dependabotHelperPolicy, ignored);
}

/** Runs the scheduled auxiliary update pipeline owned by Dependabot Helper. */
export function runAuxiliaryUpdates(
  rootDir: string,
  options: CiOptions = {},
): Promise<CiSummary[]> {
  const policyErrors = validateHelperPolicy(rootDir);
  if (policyErrors.length > 0) {
    return Promise.reject(new Error(`Helper policy failed: ${policyErrors.join("; ")}`));
  }
  const checks = runHelperChecks(rootDir);
  if (!checks.accepted) {
    return Promise.reject(new Error(`Helper checks failed: ${checks.errors.join("; ")}`));
  }
  return import("./updates/ci").then(({ runCi }) => runCi(rootDir, options));
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
    const resolved: string[] = [];
    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      if (entry.isDirectory()) resolved.push(`${workspace.slice(0, -1)}${entry.name}`);
    }
    return resolved;
  });

  for (const workspace of resolvedWorkspaces) {
    const packagePath = resolve(rootDir, workspace, "package.json");
    if (!existsSync(packagePath)) continue;
    const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as PackageJson;
    for (const section of [pkg.dependencies, pkg.devDependencies, pkg.peerDependencies]) {
      for (const [name, version] of Object.entries(section ?? {})) {
        if (matchesDependencyFamily(family, name)) {
          const resolved = version === "catalog:" ? catalog[name] : version;
          if (resolved) versions.set(`${workspace}/${name}`, normalizeVersion(resolved));
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
