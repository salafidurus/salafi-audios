import { Glob } from "bun";
import fs from "node:fs";
import path from "node:path";

import type { PackageJson, Workspace, Catalogs, CatalogConfig, CatalogPolicyRule } from "../types";

export function parseCatalogs(rootJson: PackageJson): Catalogs {
  const workspaces = rootJson.workspaces;
  return {
    default: workspaces?.catalog || {},
    named: (workspaces as any)?.catalogs || {},
  };
}

export function getWorkspaces(rootDir: string): Workspace[] {
  const rootJsonPath = path.join(rootDir, "package.json");
  if (!fs.existsSync(rootJsonPath)) {
    throw new Error(`Root package.json not found at ${rootJsonPath}`);
  }
  const rootJson: PackageJson = JSON.parse(fs.readFileSync(rootJsonPath, "utf-8"));

  const globPatterns = rootJson.workspaces?.packages || ["apps/*", "packages/*"];
  const workspaces: Workspace[] = [];

  for (const pattern of globPatterns) {
    const glob = new Glob(`${pattern}/package.json`);
    for (const relativeFile of glob.scanSync({ cwd: rootDir })) {
      const absPath = path.join(rootDir, relativeFile);
      const pkgJson: PackageJson = JSON.parse(fs.readFileSync(absPath, "utf-8"));
      workspaces.push({
        name: pkgJson.name,
        relativePath: path.dirname(relativeFile).replace(/\\/g, "/"),
        absolutePath: path.dirname(absPath),
        packageJsonPath: absPath,
        content: pkgJson,
      });
    }
  }

  return workspaces;
}

export function loadConfig(rootDir: string): CatalogConfig {
  const configPath = path.join(rootDir, "catalog.config.json");
  if (fs.existsSync(configPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      const groups = parsed.groups ?? [];
      const policies = parsed.policies ?? [];
      if (!Array.isArray(groups) || !Array.isArray(policies)) {
        throw new Error("catalog.config.json groups and policies must be arrays");
      }
      const errors = policies.flatMap(validateCatalogPolicyRule);
      if (errors.length > 0) throw new Error(`Invalid catalog policy: ${errors.join("; ")}`);
      return { groups, policies };
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Invalid catalog policy:"))
        throw error;
      throw new Error(`Unable to load catalog.config.json: ${error}`);
    }
  }
  return { groups: [], policies: [] };
}

function validateCatalogPolicyRule(rule: CatalogPolicyRule): string[] {
  const errors: string[] = [];
  if (!rule) return ["policy entries must be objects"];
  if (!rule.name?.trim()) errors.push("policy name must not be empty");
  if (!rule.reason?.trim()) errors.push(`policy '${rule.name}' must include a reason`);
  if (rule.updateCeiling === "fixed" && !rule.fixedVersion) {
    errors.push(`policy '${rule.name}' requires fixedVersion for a fixed update ceiling`);
  }
  if (rule.fixedVersion && rule.updateCeiling !== "fixed") {
    errors.push(`policy '${rule.name}' cannot define fixedVersion unless updateCeiling is fixed`);
  }
  return errors;
}

export function matchPattern(value: string, pattern: string | string[]): boolean {
  const patterns = Array.isArray(pattern) ? pattern : [pattern];

  const matchSingle = (val: string, pat: string): boolean => {
    if (!pat.includes("*")) {
      return val === pat;
    }
    if (pat === "*") return true;

    const parts = pat.split("*");
    if (!pat.startsWith("*") && !val.startsWith(parts[0]!)) {
      return false;
    }
    if (!pat.endsWith("*") && !val.endsWith(parts[parts.length - 1]!)) {
      return false;
    }

    let currentIndex = 0;
    for (const part of parts) {
      if (part === "") continue;
      const index = val.indexOf(part, currentIndex);
      if (index === -1) return false;
      currentIndex = index + part.length;
    }
    return true;
  };

  return patterns.some((pat) => matchSingle(value, pat));
}

export function getDependencyGroup(
  depName: string,
  workspacePath: string,
  config: CatalogConfig,
): string | null {
  const groups = config.groups || [];
  for (const group of groups) {
    if (matchPattern(depName, group.packages) && matchPattern(workspacePath, group.workspaces)) {
      return group.name;
    }
  }
  return null;
}

export function sanitizeGroupName(depName: string, version: string): string {
  const cleaned = version.replace(/^[^a-zA-Z0-9]+/, "").replace(/[^a-zA-Z0-9]/g, "_");
  const namePart = depName.replace(/\//g, "_");
  return `${namePart}_${cleaned}`;
}
