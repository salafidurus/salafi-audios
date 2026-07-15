import fs from "node:fs";
import path from "node:path";
import { Glob } from "bun";

export interface PackageJson {
  name: string;
  version?: string;
  workspaces?: {
    packages?: string[];
    catalog?: Record<string, string>;
    catalogs?: Record<string, Record<string, string>>;
  };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface Workspace {
  name: string;
  relativePath: string;
  absolutePath: string;
  packageJsonPath: string;
  content: PackageJson;
}

export interface Catalogs {
  default: Record<string, string>;
  named: Record<string, Record<string, string>>;
}

export interface CatalogIssue {
  type: "missing" | "mismatch" | "hardcoded" | "orphan";
  pkgName: string;
  depName: string;
  expectedVersion?: string;
  actualVersion?: string;
  details: string;
}

export interface CatalogDuplicate {
  depName: string;
  workspaces: string[];
  versions: string[];
}

export interface CatalogConfigGroup {
  name: string;
  packages: string | string[];
  workspaces: string | string[];
}

export interface CatalogConfig {
  groups: CatalogConfigGroup[];
}

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
      return { groups: parsed.groups ?? [] };
    } catch {
      return { groups: [] };
    }
  }
  return { groups: [] };
}

export function matchPattern(value: string, pattern: string | string[]): boolean {
  const patterns = Array.isArray(pattern) ? pattern : [pattern];

  const matchSingle = (val: string, pat: string): boolean => {
    if (!pat.includes("*")) {
      return val === pat;
    }
    if (pat === "*") return true;

    const parts = pat.split("*");
    if (!pat.startsWith("*") && !val.startsWith(parts[0])) {
      return false;
    }
    if (!pat.endsWith("*") && !val.endsWith(parts[parts.length - 1])) {
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
