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
        relativePath: path.dirname(relativeFile),
        absolutePath: path.dirname(absPath),
        packageJsonPath: absPath,
        content: pkgJson,
      });
    }
  }

  return workspaces;
}

export interface CatalogIssue {
  type: "missing" | "mismatch" | "hardcoded";
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

export function runCatalogCheck(rootDir: string): { issues: CatalogIssue[], duplicates: CatalogDuplicate[] } {
  const rootJsonPath = path.join(rootDir, "package.json");
  const rootJson: PackageJson = JSON.parse(fs.readFileSync(rootJsonPath, "utf-8"));
  const catalogs = parseCatalogs(rootJson);
  const workspaces = getWorkspaces(rootDir);
  const allPackages = [{ name: "root", content: rootJson }, ...workspaces];

  const dependencyMap: Record<string, { workspaces: string[]; versions: string[] }> = {};
  const issues: CatalogIssue[] = [];
  const duplicates: CatalogDuplicate[] = [];

  for (const pkg of allPackages) {
    const depTypes = ["dependencies", "devDependencies"] as const;
    for (const depType of depTypes) {
      const deps = pkg.content[depType] || {};
      for (const [name, version] of Object.entries(deps)) {
        if (version.startsWith("workspace:") || name.startsWith("@sd/")) continue;

        if (!version.startsWith("catalog:")) {
          if (!dependencyMap[name]) {
            dependencyMap[name] = { workspaces: [], versions: [] };
          }
          dependencyMap[name].workspaces.push(pkg.name);
          dependencyMap[name].versions.push(version);
        }

        if (version === "catalog:") {
          if (!catalogs.default[name]) {
            issues.push({
              type: "missing",
              pkgName: pkg.name,
              depName: name,
              details: `'${pkg.name}': '${name}' uses "catalog:" but is missing from default catalog`
            });
          }
        } else if (version.startsWith("catalog:")) {
          const groupName = version.split(":")[1];
          if (!catalogs.named[groupName] || !catalogs.named[groupName][name]) {
            issues.push({
              type: "missing",
              pkgName: pkg.name,
              depName: name,
              details: `'${pkg.name}': '${name}' uses "${version}" but is missing from catalogs.${groupName}`
            });
          }
        } else {
          // Explicit version check
          if (catalogs.default[name]) {
            if (catalogs.default[name] === version) {
              issues.push({
                type: "hardcoded",
                pkgName: pkg.name,
                depName: name,
                expectedVersion: catalogs.default[name],
                actualVersion: version,
                details: `'${pkg.name}': '${name}' specifies "${version}" explicitly but matches default catalog (should use "catalog:")`
              });
            } else {
              issues.push({
                type: "mismatch",
                pkgName: pkg.name,
                depName: name,
                expectedVersion: catalogs.default[name],
                actualVersion: version,
                details: `'${pkg.name}': '${name}' specifies "${version}" explicitly but default catalog has "${catalogs.default[name]}"`
              });
            }
          }

          for (const [groupName, groupDeps] of Object.entries(catalogs.named)) {
            if (groupDeps[name]) {
              if (groupDeps[name] === version) {
                issues.push({
                  type: "hardcoded",
                  pkgName: pkg.name,
                  depName: name,
                  expectedVersion: groupDeps[name],
                  actualVersion: version,
                  details: `'${pkg.name}': '${name}' specifies "${version}" explicitly but matches catalogs.${groupName} (should use "catalog:${groupName}")`
                });
              }
            }
          }
        }
      }
    }
  }

  for (const [name, info] of Object.entries(dependencyMap)) {
    const isCataloged = catalogs.default[name] || Object.values(catalogs.named).some(g => g[name]);
    if (!isCataloged && info.workspaces.length >= 2) {
      duplicates.push({
        depName: name,
        workspaces: info.workspaces,
        versions: info.versions
      });
    }
  }

  return { issues, duplicates };
}

export function runCatalogFix(rootDir: string, options: { force?: boolean } = {}): { updatedFiles: string[] } {
  const rootJsonPath = path.join(rootDir, "package.json");
  const rootJson = JSON.parse(fs.readFileSync(rootJsonPath, "utf-8"));
  const catalogs = parseCatalogs(rootJson);
  const workspaces = getWorkspaces(rootDir);
  const allPackages = [{ name: "root", path: rootJsonPath, content: rootJson }, ...workspaces];
  const updatedFiles: string[] = [];

  const compareSemver = (v1: string, v2: string): number => {
    const clean = (v: string) => v.replace(/^[\^~v]/, "").split(".");
    const parts1 = clean(v1).map(Number);
    const parts2 = clean(v2).map(Number);
    for (let i = 0; i < 3; i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 !== p2) return p1 - p2;
    }
    return 0;
  };

  for (const pkg of allPackages) {
    let modified = false;
    const depTypes = ["dependencies", "devDependencies"] as const;

    for (const depType of depTypes) {
      const deps = pkg.content[depType];
      if (!deps) continue;

      for (const [name, version] of Object.entries(deps)) {
        if (version.startsWith("workspace:") || name.startsWith("@sd/")) continue;
        if (version.startsWith("catalog:")) continue;

        if (catalogs.default[name] && catalogs.default[name] === version) {
          deps[name] = "catalog:";
          modified = true;
          continue;
        }

        let matchedNamed = false;
        for (const [groupName, groupDeps] of Object.entries(catalogs.named)) {
          if (groupDeps[name] && groupDeps[name] === version) {
            deps[name] = `catalog:${groupName}`;
            modified = true;
            matchedNamed = true;
            break;
          }
        }
        if (matchedNamed) continue;

        // Mismatch force-fix (if enabled)
        if (options.force) {
          const candidates: { groupName?: string; version: string }[] = [];
          if (catalogs.default[name]) {
            candidates.push({ version: catalogs.default[name] });
          }
          for (const [groupName, groupDeps] of Object.entries(catalogs.named)) {
            if (groupDeps[name]) {
              candidates.push({ groupName, version: groupDeps[name] });
            }
          }

          if (candidates.length > 0) {
            candidates.sort((a, b) => compareSemver(b.version, a.version));
            const highest = candidates[0];
            if (highest.groupName) {
              deps[name] = `catalog:${highest.groupName}`;
            } else {
              deps[name] = "catalog:";
            }
            modified = true;
          }
        }
      }
    }

    if (modified) {
      const pathToWrite = (pkg as any).path || (pkg as any).packageJsonPath;
      fs.writeFileSync(pathToWrite, JSON.stringify(pkg.content, null, 2) + "\n");
      updatedFiles.push(pkg.name);
    }
  }

  return { updatedFiles };
}

export function getUnusedCatalogEntries(rootDir: string) {
  const rootJsonPath = path.join(rootDir, "package.json");
  const rootJson: PackageJson = JSON.parse(fs.readFileSync(rootJsonPath, "utf-8"));
  const catalogs = parseCatalogs(rootJson);
  const workspaces = getWorkspaces(rootDir);
  const allPackages = [{ name: "root", content: rootJson }, ...workspaces];

  const usedInDefault = new Set<string>();
  const usedInNamed: Record<string, Set<string>> = {};
  for (const group of Object.keys(catalogs.named)) {
    usedInNamed[group] = new Set();
  }

  for (const pkg of allPackages) {
    const depTypes = ["dependencies", "devDependencies"] as const;
    for (const depType of depTypes) {
      const deps = pkg.content[depType] || {};
      for (const [name, version] of Object.entries(deps)) {
        if (version === "catalog:") {
          usedInDefault.add(name);
        } else if (version.startsWith("catalog:")) {
          const groupName = version.split(":")[1];
          if (usedInNamed[groupName]) {
            usedInNamed[groupName].add(name);
          }
        }
      }
    }
  }

  const unusedDefault: string[] = [];
  const unusedNamed: Record<string, string[]> = {};

  for (const name of Object.keys(catalogs.default)) {
    if (!usedInDefault.has(name)) unusedDefault.push(name);
  }

  for (const [groupName, groupDeps] of Object.entries(catalogs.named)) {
    unusedNamed[groupName] = [];
    for (const name of Object.keys(groupDeps)) {
      if (!usedInNamed[groupName]?.has(name)) {
        unusedNamed[groupName].push(name);
      }
    }
  }

  return { unusedDefault, unusedNamed };
}

export function runCatalogPrune(rootDir: string): { prunedCount: number } {
  const rootJsonPath = path.join(rootDir, "package.json");
  const rootJson = JSON.parse(fs.readFileSync(rootJsonPath, "utf-8"));
  const { unusedDefault, unusedNamed } = getUnusedCatalogEntries(rootDir);

  let prunedCount = 0;

  if (unusedDefault.length > 0 && rootJson.workspaces?.catalog) {
    for (const name of unusedDefault) {
      delete rootJson.workspaces.catalog[name];
      prunedCount++;
    }
  }

  if (rootJson.workspaces?.catalogs) {
    for (const [groupName, list] of Object.entries(unusedNamed)) {
      if (list.length > 0 && rootJson.workspaces.catalogs[groupName]) {
        for (const name of list) {
          delete rootJson.workspaces.catalogs[groupName][name];
          prunedCount++;
        }
      }
    }
  }

  if (prunedCount > 0) {
    fs.writeFileSync(rootJsonPath, JSON.stringify(rootJson, null, 2) + "\n");
  }

  return { prunedCount };
}
