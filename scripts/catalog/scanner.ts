import fs from "node:fs";
import path from "node:path";
import {
  parseCatalogs,
  getWorkspaces,
  loadConfig,
  getDependencyGroup,
  sanitizeGroupName,
  matchPattern,
} from "./helpers";
import type { PackageJson, CatalogConfigGroup, CatalogIssue, CatalogDuplicate } from "./helpers";

export type {
  PackageJson,
  CatalogConfig,
  CatalogConfigGroup,
  CatalogIssue,
  CatalogDuplicate,
} from "./helpers";
export {
  parseCatalogs,
  getWorkspaces,
  loadConfig,
  getDependencyGroup,
  sanitizeGroupName,
} from "./helpers";

export interface CatalogStats {
  overview: {
    totalWorkspaces: number;
    uniqueExternalDeps: number;
    eligibleDeps: number;
    correctlyCataloged: number;
    uncataloged: number;
    miscatalogued: number;
    coveragePercent: number;
  };
  entries: {
    default: number;
    named: { name: string; entries: number }[];
    total: number;
  };
  perWorkspace: {
    name: string;
    relativePath: string;
    totalDeps: number;
    catalogedEligible: number;
    percent: number;
  }[];
  candidates: {
    depName: string;
    groups: { version: string; workspaces: string[] }[];
  }[];
  unused: {
    default: string[];
    named: { group: string; entries: string[] }[];
    total: number;
  };
  alignment: {
    issues: number;
    duplicates: number;
  };
}

function getAllPackages(rootDir: string) {
  const rootJsonPath = path.join(rootDir, "package.json");
  const rootJson: PackageJson = JSON.parse(fs.readFileSync(rootJsonPath, "utf-8"));
  const workspaces = getWorkspaces(rootDir);
  return {
    rootJson,
    workspaces,
    allPackages: [
      { name: "root", content: rootJson, relativePath: "" },
      ...workspaces.map((w) => ({
        name: w.name,
        content: w.content,
        relativePath: w.relativePath,
      })),
    ],
  };
}

export function runCatalogCheck(rootDir: string): {
  issues: CatalogIssue[];
  duplicates: CatalogDuplicate[];
} {
  const { rootJson, allPackages } = getAllPackages(rootDir);
  const catalogs = parseCatalogs(rootJson);
  const config = loadConfig(rootDir);

  const dependencyMap: Record<string, { workspaces: string[]; versions: string[] }> = {};
  const issues: CatalogIssue[] = [];
  const duplicates: CatalogDuplicate[] = [];
  const depPackageSet = new Map<string, Set<string>>();

  for (const pkg of allPackages) {
    const depTypes = ["dependencies", "devDependencies"] as const;
    for (const depType of depTypes) {
      const deps = pkg.content[depType] || {};
      for (const [name, version] of Object.entries(deps)) {
        if (version.startsWith("workspace:") || name.startsWith("@sd/")) continue;

        if (!depPackageSet.has(name)) depPackageSet.set(name, new Set());
        depPackageSet.get(name)!.add(pkg.name);

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
              details: `'${pkg.name}': '${name}' uses "catalog:" but is missing from default catalog`,
            });
          }
        } else if (version.startsWith("catalog:")) {
          const groupName = version.split(":")[1];
          if (!catalogs.named[groupName] || !catalogs.named[groupName][name]) {
            issues.push({
              type: "missing",
              pkgName: pkg.name,
              depName: name,
              details: `'${pkg.name}': '${name}' uses "${version}" but is missing from catalogs.${groupName}`,
            });
          }
        } else {
          const groupName = getDependencyGroup(name, pkg.relativePath, config);

          if (groupName && catalogs.named[groupName]?.[name]) {
            const expected = catalogs.named[groupName][name];
            if (expected === version) {
              issues.push({
                type: "hardcoded",
                pkgName: pkg.name,
                depName: name,
                expectedVersion: expected,
                actualVersion: version,
                details: `'${pkg.name}': '${name}' specifies "${version}" explicitly but matches catalogs.${groupName} (should use "catalog:${groupName}")`,
              });
            } else {
              issues.push({
                type: "mismatch",
                pkgName: pkg.name,
                depName: name,
                expectedVersion: expected,
                actualVersion: version,
                details: `'${pkg.name}': '${name}' specifies "${version}" explicitly but catalogs.${groupName} has "${expected}"`,
              });
            }
          } else if (!groupName && catalogs.default[name]) {
            const expected = catalogs.default[name];
            if (expected === version) {
              issues.push({
                type: "hardcoded",
                pkgName: pkg.name,
                depName: name,
                expectedVersion: expected,
                actualVersion: version,
                details: `'${pkg.name}': '${name}' specifies "${version}" explicitly but matches default catalog (should use "catalog:")`,
              });
            } else {
              issues.push({
                type: "mismatch",
                pkgName: pkg.name,
                depName: name,
                expectedVersion: expected,
                actualVersion: version,
                details: `'${pkg.name}': '${name}' specifies "${version}" explicitly but default catalog has "${expected}"`,
              });
            }
          }
        }
      }
    }
  }

  for (const [name, info] of Object.entries(dependencyMap)) {
    const isCataloged =
      catalogs.default[name] || Object.values(catalogs.named).some((g) => g[name]);
    if (!isCataloged && info.workspaces.length >= 2) {
      duplicates.push({
        depName: name,
        workspaces: info.workspaces,
        versions: info.versions,
      });
    }
  }

  for (const name of Object.keys(catalogs.default)) {
    const pkgs = depPackageSet.get(name);
    if (!pkgs || pkgs.size < 2) {
      issues.push({
        type: "orphan",
        pkgName: "-",
        depName: name,
        details: `'${name}' is in default catalog but only used by ${pkgs?.size ?? 0} package(s) (expected 2+)`,
      });
    }
  }

  for (const [groupName, groupDeps] of Object.entries(catalogs.named)) {
    for (const name of Object.keys(groupDeps)) {
      const pkgs = depPackageSet.get(name);
      if (!pkgs || pkgs.size < 2) {
        issues.push({
          type: "orphan",
          pkgName: "-",
          depName: name,
          details: `'${name}' is in catalog:${groupName} but only used by ${pkgs?.size ?? 0} package(s) (expected 2+)`,
        });
      }
    }
  }

  return { issues, duplicates };
}

export function runCatalogFix(rootDir: string): { updatedFiles: string[] } {
  const rootJsonPath = path.join(rootDir, "package.json");
  const rootJson: PackageJson = JSON.parse(fs.readFileSync(rootJsonPath, "utf-8"));
  const catalogs = parseCatalogs(rootJson);
  const config = loadConfig(rootDir);
  const workspaces = getWorkspaces(rootDir);

  const allWorkspacePkgs = workspaces.map((w) => ({
    name: w.name,
    relativePath: w.relativePath,
    filePath: w.packageJsonPath,
    content: w.content,
  }));

  // Include root as a workspace so its deps are scanned and aligned
  allWorkspacePkgs.push({
    name: "root",
    relativePath: ".",
    filePath: rootJsonPath,
    content: rootJson,
  });

  interface DepUsage {
    depName: string;
    version: string;
    pkgName: string;
    relativePath: string;
    filePath: string;
    depType: "dependencies" | "devDependencies";
  }

  const explicitDeps: DepUsage[] = [];

  for (const pkg of allWorkspacePkgs) {
    const depTypes = ["dependencies", "devDependencies"] as const;
    for (const depType of depTypes) {
      const deps = pkg.content[depType] || {};
      for (const [name, version] of Object.entries(deps)) {
        if (version.startsWith("workspace:") || name.startsWith("@sd/")) continue;
        if (version.startsWith("catalog:")) continue;
        explicitDeps.push({
          depName: name,
          version,
          pkgName: pkg.name,
          relativePath: pkg.relativePath,
          filePath: pkg.filePath,
          depType,
        });
      }
    }
  }

  const defaultCatalogUpdates = new Map<string, string>();
  const namedCatalogUpdates = new Map<string, Map<string, string>>();
  const configGroupEntries = new Map<string, { packages: Set<string>; workspaces: Set<string> }>();
  const refUpdates: {
    pkgName: string;
    filePath: string;
    depName: string;
    depType: "dependencies" | "devDependencies";
    newRef: string;
  }[] = [];

  function addRefUpdate(
    pkgName: string,
    filePath: string,
    depName: string,
    depType: "dependencies" | "devDependencies",
    groupName: string | null,
  ) {
    refUpdates.push({
      pkgName,
      filePath,
      depName,
      depType,
      newRef: groupName ? `catalog:${groupName}` : "catalog:",
    });
  }

  function addNamedCatalogEntry(groupName: string, depName: string, version: string) {
    if (!namedCatalogUpdates.has(groupName)) {
      namedCatalogUpdates.set(groupName, new Map());
    }
    namedCatalogUpdates.get(groupName)!.set(depName, version);
  }

  function addConfigGroup(groupName: string, depName: string, workspacePath: string) {
    if (!configGroupEntries.has(groupName)) {
      configGroupEntries.set(groupName, { packages: new Set(), workspaces: new Set() });
    }
    const entry = configGroupEntries.get(groupName)!;
    entry.packages.add(depName);
    entry.workspaces.add(workspacePath);
  }

  const depsByName = new Map<string, DepUsage[]>();
  for (const dep of explicitDeps) {
    if (!depsByName.has(dep.depName)) depsByName.set(dep.depName, []);
    depsByName.get(dep.depName)!.push(dep);
  }

  for (const [depName, usages] of depsByName) {
    if (usages.length < 2) continue;
    const matched: { usage: DepUsage; groupName: string }[] = [];
    const unmatched: DepUsage[] = [];

    for (const usage of usages) {
      const groupName = getDependencyGroup(depName, usage.relativePath, config);
      if (groupName) {
        matched.push({ usage, groupName });
      } else {
        unmatched.push(usage);
      }
    }

    for (const { usage, groupName } of matched) {
      addNamedCatalogEntry(groupName, depName, usage.version);
      addRefUpdate(usage.pkgName, usage.filePath, depName, usage.depType, groupName);
    }

    if (unmatched.length > 0) {
      const versionCounts = new Map<string, number>();
      for (const u of unmatched) {
        versionCounts.set(u.version, (versionCounts.get(u.version) || 0) + 1);
      }

      if (versionCounts.size === 1) {
        const version = unmatched[0].version;
        defaultCatalogUpdates.set(depName, version);
        for (const u of unmatched) {
          addRefUpdate(u.pkgName, u.filePath, depName, u.depType, null);
        }
      } else {
        const sorted = [...versionCounts.entries()].sort((a, b) => {
          if (b[1] !== a[1]) return b[1] - a[1];
          const clean = (v: string) => v.replace(/^[\^~v]/, "").split(".");
          const partsA = clean(a[0]).map(Number);
          const partsB = clean(b[0]).map(Number);
          for (let i = 0; i < 3; i++) {
            const pA = partsA[i] || 0;
            const pB = partsB[i] || 0;
            if (pA !== pB) return pB - pA;
          }
          return 0;
        });

        const canonicalVersion = sorted[0][0];
        defaultCatalogUpdates.set(depName, canonicalVersion);

        for (const u of unmatched) {
          if (u.version === canonicalVersion) {
            addRefUpdate(u.pkgName, u.filePath, depName, u.depType, null);
          } else {
            const groupName = sanitizeGroupName(depName, u.version);
            addNamedCatalogEntry(groupName, depName, u.version);
            addConfigGroup(groupName, depName, u.relativePath);
            addRefUpdate(u.pkgName, u.filePath, depName, u.depType, groupName);
          }
        }
      }
    }
  }

  // Orphan resolution: remove catalog entries for deps used by <2 packages
  const allDepPkgs = new Map<string, Set<string>>();
  for (const pkg of allWorkspacePkgs) {
    const depTypes = ["dependencies", "devDependencies"] as const;
    for (const depType of depTypes) {
      const deps = pkg.content[depType] || {};
      for (const [name] of Object.entries(deps)) {
        if (name.startsWith("@sd/")) continue; // workspace: also handled via startsWith check elsewhere
        if (!allDepPkgs.has(name)) allDepPkgs.set(name, new Set());
        allDepPkgs.get(name)!.add(pkg.name);
      }
    }
  }

  const orphanRemovals: { depName: string; version: string; group: string | null }[] = [];
  for (const [name, version] of Object.entries(catalogs.default)) {
    const pkgs = allDepPkgs.get(name);
    if (pkgs && pkgs.size >= 2) continue;
    orphanRemovals.push({ depName: name, version, group: null });
  }
  for (const [groupName, groupDeps] of Object.entries(catalogs.named)) {
    for (const [name, version] of Object.entries(groupDeps)) {
      const pkgs = allDepPkgs.get(name);
      if (pkgs && pkgs.size >= 2) continue;
      orphanRemovals.push({ depName: name, version, group: groupName });
    }
  }

  for (const orphan of orphanRemovals) {
    if (orphan.group) {
      if (rootJson.workspaces?.catalogs?.[orphan.group]) {
        delete rootJson.workspaces.catalogs[orphan.group][orphan.depName];
      }
    } else {
      if (rootJson.workspaces?.catalog) {
        delete rootJson.workspaces.catalog[orphan.depName];
      }
    }
    // Revert any catalog: refs in workspaces to explicit version
    for (const pkg of allWorkspacePkgs) {
      const depTypes = ["dependencies", "devDependencies"] as const;
      for (const depType of depTypes) {
        const deps = pkg.content[depType] || {};
        for (const [name, version] of Object.entries(deps)) {
          if (name !== orphan.depName) continue;
          const expectedRef = orphan.group ? `catalog:${orphan.group}` : "catalog:";
          if (version === expectedRef) {
            refUpdates.push({
              pkgName: pkg.name,
              filePath: pkg.filePath,
              depType,
              depName: name,
              newRef: orphan.version,
            });
          }
        }
      }
    }
  }

  if (
    refUpdates.length === 0 &&
    defaultCatalogUpdates.size === 0 &&
    namedCatalogUpdates.size === 0 &&
    orphanRemovals.length === 0
  ) {
    // Still might need to clean up empty named groups
    let hadEmptyGroupCleanup = false;
    if (rootJson.workspaces?.catalogs) {
      for (const group of Object.keys(rootJson.workspaces.catalogs)) {
        if (Object.keys(rootJson.workspaces.catalogs[group]).length === 0) {
          delete rootJson.workspaces.catalogs[group];
          hadEmptyGroupCleanup = true;
        }
      }
      if (Object.keys(rootJson.workspaces.catalogs).length === 0) {
        delete rootJson.workspaces.catalogs;
      }
    }
    if (hadEmptyGroupCleanup) {
      fs.writeFileSync(rootJsonPath, JSON.stringify(rootJson, null, 2) + "\n");
      return { updatedFiles: ["root"] };
    }
    return { updatedFiles: [] };
  }

  // Clean up empty named catalog groups
  if (rootJson.workspaces?.catalogs) {
    for (const group of Object.keys(rootJson.workspaces.catalogs)) {
      if (Object.keys(rootJson.workspaces.catalogs[group]).length === 0) {
        delete rootJson.workspaces.catalogs[group];
      }
    }
    if (Object.keys(rootJson.workspaces.catalogs).length === 0) {
      delete rootJson.workspaces.catalogs;
    }
  }

  const updatedFilesSet = new Set<string>();

  if (orphanRemovals.length > 0) {
    updatedFilesSet.add("root");
  }

  if (defaultCatalogUpdates.size > 0 || namedCatalogUpdates.size > 0) {
    if (!rootJson.workspaces) rootJson.workspaces = {};
    if (!rootJson.workspaces.catalog) rootJson.workspaces.catalog = {};
    if (!rootJson.workspaces.catalogs) rootJson.workspaces.catalogs = {};

    for (const [depName, version] of defaultCatalogUpdates) {
      rootJson.workspaces.catalog[depName] = version;
    }

    for (const [groupName, deps] of namedCatalogUpdates) {
      if (!rootJson.workspaces.catalogs[groupName]) {
        rootJson.workspaces.catalogs[groupName] = {};
      }
      for (const [depName, version] of deps) {
        rootJson.workspaces.catalogs[groupName][depName] = version;
      }
    }

    fs.writeFileSync(rootJsonPath, JSON.stringify(rootJson, null, 2) + "\n");
    updatedFilesSet.add("root");
  } else if (orphanRemovals.length > 0) {
    // Orphan-only changes need rootJson written too
    fs.writeFileSync(rootJsonPath, JSON.stringify(rootJson, null, 2) + "\n");
    updatedFilesSet.add("root");
  }

  if (configGroupEntries.size > 0) {
    const configGroups: CatalogConfigGroup[] = [...config.groups];
    const existingGroupNames = new Set(config.groups.map((g) => g.name));

    for (const [groupName, data] of configGroupEntries) {
      if (!existingGroupNames.has(groupName)) {
        configGroups.push({
          name: groupName,
          packages: [...data.packages].sort(),
          workspaces: [...data.workspaces].sort(),
        });
      }
    }

    fs.writeFileSync(
      path.join(rootDir, "catalog.config.json"),
      JSON.stringify({ groups: configGroups }, null, 2) + "\n",
    );
    updatedFilesSet.add("catalog.config.json");
  }

  // Force-align remaining explicit deps to catalog entries
  const trackedRefs = new Set(refUpdates.map((r) => `${r.pkgName}:${r.depName}`));
  for (const [depName, version] of defaultCatalogUpdates) {
    catalogs.default[depName] = version;
  }
  for (const [groupName, deps] of namedCatalogUpdates) {
    if (!catalogs.named[groupName]) catalogs.named[groupName] = {};
    for (const [depName, version] of deps) {
      catalogs.named[groupName][depName] = version;
    }
  }

  for (const pkg of allWorkspacePkgs) {
    const depTypes = ["dependencies", "devDependencies"] as const;
    for (const depType of depTypes) {
      const deps = pkg.content[depType] || {};
      for (const [name, version] of Object.entries(deps)) {
        if (version.startsWith("workspace:") || name.startsWith("@sd/")) continue;
        if (version.startsWith("catalog:")) continue;
        if (trackedRefs.has(`${pkg.name}:${name}`)) continue;
        if (catalogs.default[name]) {
          refUpdates.push({
            pkgName: pkg.name,
            filePath: pkg.filePath,
            depType,
            depName: name,
            newRef: "catalog:",
          });
        } else {
          for (const [groupName, groupDeps] of Object.entries(catalogs.named)) {
            if (groupDeps[name]) {
              refUpdates.push({
                pkgName: pkg.name,
                filePath: pkg.filePath,
                depType,
                depName: name,
                newRef: `catalog:${groupName}`,
              });
              break;
            }
          }
        }
      }
    }
  }

  const writtenWorkspaces = new Set<string>();
  for (const update of refUpdates) {
    if (writtenWorkspaces.has(update.filePath)) continue;
    writtenWorkspaces.add(update.filePath);
    const raw = JSON.parse(fs.readFileSync(update.filePath, "utf-8"));
    const fileUpdates = refUpdates.filter((u) => u.filePath === update.filePath);
    let pkgName = "";
    for (const fu of fileUpdates) {
      if (!raw[fu.depType]) raw[fu.depType] = {};
      raw[fu.depType][fu.depName] = fu.newRef;
      pkgName = fu.pkgName;
    }
    fs.writeFileSync(update.filePath, JSON.stringify(raw, null, 2) + "\n");
    updatedFilesSet.add(pkgName);
  }

  return { updatedFiles: [...updatedFilesSet] };
}

export function runCatalogFixForce(rootDir: string): { updatedFiles: string[] } {
  const rootJsonPath = path.join(rootDir, "package.json");
  const rootJson: PackageJson = JSON.parse(fs.readFileSync(rootJsonPath, "utf-8"));
  const catalogs = parseCatalogs(rootJson);
  const config = loadConfig(rootDir);
  const workspaces = getWorkspaces(rootDir);

  const allWorkspacePkgs = workspaces.map((w) => ({
    name: w.name,
    relativePath: w.relativePath,
    filePath: w.packageJsonPath,
    content: w.content,
  }));

  allWorkspacePkgs.push({
    name: "root",
    relativePath: ".",
    filePath: rootJsonPath,
    content: rootJson,
  });

  const refUpdates: {
    pkgName: string;
    filePath: string;
    depType: "dependencies" | "devDependencies";
    depName: string;
    newRef: string;
  }[] = [];

  const updatedFilesSet = new Set<string>();

  const groupEntries = config.groups || [];
  for (const group of groupEntries) {
    if (!catalogs.named[group.name]) continue;

    const patterns = Array.isArray(group.packages) ? group.packages : [group.packages];
    const workspacePatterns = Array.isArray(group.workspaces)
      ? group.workspaces
      : [group.workspaces];

    for (const pkg of allWorkspacePkgs) {
      const matchesWorkspace = workspacePatterns.some((wp) => matchPattern(pkg.relativePath, wp));
      if (!matchesWorkspace) continue;

      const depTypes = ["dependencies", "devDependencies"] as const;
      for (const depType of depTypes) {
        const deps = pkg.content[depType] || {};
        for (const [name, version] of Object.entries(deps)) {
          if (version.startsWith("workspace:") || name.startsWith("@sd/")) continue;
          if (!patterns.includes(name)) continue;

          if (!catalogs.named[group.name][name]) {
            catalogs.named[group.name][name] = version;
          }

          if (version !== `catalog:${group.name}`) {
            refUpdates.push({
              pkgName: pkg.name,
              filePath: pkg.filePath,
              depType,
              depName: name,
              newRef: `catalog:${group.name}`,
            });
          }
        }
      }
    }
  }

  for (const [depName] of Object.entries(catalogs.default)) {
    for (const pkg of allWorkspacePkgs) {
      const groupMatch = getDependencyGroup(depName, pkg.relativePath, config);
      if (groupMatch) continue;

      const depTypes = ["dependencies", "devDependencies"] as const;
      for (const depType of depTypes) {
        const deps = pkg.content[depType] || {};
        for (const [name, version] of Object.entries(deps)) {
          if (name !== depName) continue;
          if (version.startsWith("workspace:") || name.startsWith("@sd/")) continue;

          if (version !== "catalog:") {
            refUpdates.push({
              pkgName: pkg.name,
              filePath: pkg.filePath,
              depType,
              depName: name,
              newRef: "catalog:",
            });
          }
        }
      }
    }
  }

  if (refUpdates.length > 0) {
    let rootModified = false;
    for (const group of groupEntries) {
      if (catalogs.named[group.name]) {
        for (const [name, version] of Object.entries(catalogs.named[group.name])) {
          if (!rootJson.workspaces?.catalogs?.[group.name]?.[name]) {
            if (!rootJson.workspaces) rootJson.workspaces = {};
            if (!rootJson.workspaces.catalogs) rootJson.workspaces.catalogs = {};
            if (!rootJson.workspaces.catalogs[group.name])
              rootJson.workspaces.catalogs[group.name] = {};
            rootJson.workspaces.catalogs[group.name][name] = version;
            rootModified = true;
          }
        }
      }
    }
    if (rootModified) {
      fs.writeFileSync(rootJsonPath, JSON.stringify(rootJson, null, 2) + "\n");
      updatedFilesSet.add("root");
    }
  }

  const writtenWorkspaces = new Set<string>();
  for (const update of refUpdates) {
    if (writtenWorkspaces.has(update.filePath)) {
      continue;
    }
    writtenWorkspaces.add(update.filePath);

    const raw = JSON.parse(fs.readFileSync(update.filePath, "utf-8"));
    const fileUpdates = refUpdates.filter((u) => u.filePath === update.filePath);
    let pkgName = "";
    for (const fu of fileUpdates) {
      if (!raw[fu.depType]) raw[fu.depType] = {};
      raw[fu.depType][fu.depName] = fu.newRef;
      pkgName = fu.pkgName;
    }
    fs.writeFileSync(update.filePath, JSON.stringify(raw, null, 2) + "\n");
    updatedFilesSet.add(pkgName);
  }

  // Clean up empty named catalog groups
  if (rootJson.workspaces?.catalogs) {
    for (const group of Object.keys(rootJson.workspaces.catalogs)) {
      if (Object.keys(rootJson.workspaces.catalogs[group]).length === 0) {
        delete rootJson.workspaces.catalogs[group];
        updatedFilesSet.add("root");
      }
    }
    if (Object.keys(rootJson.workspaces.catalogs).length === 0) {
      delete rootJson.workspaces.catalogs;
    }
  }

  return { updatedFiles: [...updatedFilesSet] };
}

export function getUnusedCatalogEntries(rootDir: string) {
  const { rootJson, workspaces } = getAllPackages(rootDir);
  const catalogs = parseCatalogs(rootJson);
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

  // Clean up empty named catalog groups after pruning
  if (rootJson.workspaces?.catalogs) {
    for (const group of Object.keys(rootJson.workspaces.catalogs)) {
      if (Object.keys(rootJson.workspaces.catalogs[group]).length === 0) {
        delete rootJson.workspaces.catalogs[group];
        prunedCount++;
      }
    }
    if (Object.keys(rootJson.workspaces.catalogs).length === 0) {
      delete rootJson.workspaces.catalogs;
    }
  }

  if (prunedCount > 0) {
    fs.writeFileSync(rootJsonPath, JSON.stringify(rootJson, null, 2) + "\n");
  }

  return { prunedCount };
}

export function runCatalogStats(rootDir: string): CatalogStats {
  const { rootJson, workspaces, allPackages } = getAllPackages(rootDir);
  const catalogs = parseCatalogs(rootJson);
  const { issues, duplicates } = runCatalogCheck(rootDir);
  const { unusedDefault, unusedNamed } = getUnusedCatalogEntries(rootDir);

  const externalDepNames = new Set<string>();
  const catalogedDepNames = new Set<string>();
  const depUsage = new Map<string, { pkgName: string; version: string }[]>();

  for (const pkg of allPackages) {
    const depTypes = ["dependencies", "devDependencies"] as const;
    for (const depType of depTypes) {
      const deps = pkg.content[depType] || {};
      for (const [name, version] of Object.entries(deps)) {
        if (version.startsWith("workspace:") || name.startsWith("@sd/")) continue;
        externalDepNames.add(name);

        if (version === "catalog:" || version.startsWith("catalog:")) {
          catalogedDepNames.add(name);
        }

        if (!depUsage.has(name)) depUsage.set(name, []);
        depUsage.get(name)!.push({ pkgName: pkg.name, version });
      }
    }
  }

  const candidates: { depName: string; groups: { version: string; workspaces: string[] }[] }[] = [];
  for (const name of externalDepNames) {
    if (catalogedDepNames.has(name)) continue;
    const usage = depUsage.get(name) || [];
    if (usage.length < 2) continue;

    const versionMap = new Map<string, string[]>();
    for (const u of usage) {
      if (!versionMap.has(u.version)) versionMap.set(u.version, []);
      versionMap.get(u.version)!.push(u.pkgName);
    }

    candidates.push({
      depName: name,
      groups: [...versionMap.entries()].map(([version, workspaces]) => ({
        version,
        workspaces: [...new Set(workspaces)],
      })),
    });
  }

  const uniqueExternalDeps = externalDepNames.size;
  const eligibleDepNames = new Set<string>();
  for (const name of externalDepNames) {
    const uniquePkgs = new Set((depUsage.get(name) || []).map((u) => u.pkgName));
    if (uniquePkgs.size >= 2) eligibleDepNames.add(name);
  }
  const eligibleDeps = eligibleDepNames.size;
  const correctlyCataloged = [...eligibleDepNames].filter((n) => catalogedDepNames.has(n)).length;
  const uncataloged = eligibleDeps - correctlyCataloged;

  const miscataloguedDepNames = new Set<string>();
  for (const name of Object.keys(catalogs.default)) {
    if (!eligibleDepNames.has(name)) miscataloguedDepNames.add(name);
  }
  for (const groupDeps of Object.values(catalogs.named)) {
    for (const name of Object.keys(groupDeps)) {
      if (!eligibleDepNames.has(name)) miscataloguedDepNames.add(name);
    }
  }
  for (const name of catalogedDepNames) {
    if (!eligibleDepNames.has(name)) miscataloguedDepNames.add(name);
  }
  const miscatalogued = miscataloguedDepNames.size;

  const coverageDenominator = correctlyCataloged + uncataloged + miscatalogued;
  const coveragePercent =
    coverageDenominator > 0 ? Math.round((correctlyCataloged / coverageDenominator) * 100) : 100;

  const perWorkspace: {
    name: string;
    relativePath: string;
    totalDeps: number;
    catalogedEligible: number;
    percent: number;
  }[] = [];

  for (const ws of workspaces) {
    let wsCorrect = 0;
    let wsUncatalogued = 0;
    let wsMiscatalogued = 0;
    const depTypes = ["dependencies", "devDependencies"] as const;
    for (const depType of depTypes) {
      const deps = ws.content[depType] || {};
      for (const [name, version] of Object.entries(deps)) {
        if (version.startsWith("workspace:") || name.startsWith("@sd/")) continue;
        const usesCatalog = version === "catalog:" || version.startsWith("catalog:");
        const isEligible = eligibleDepNames.has(name);
        if (isEligible && usesCatalog) wsCorrect++;
        else if (isEligible && !usesCatalog) wsUncatalogued++;
        else if (!isEligible && usesCatalog) wsMiscatalogued++;
      }
    }
    const wsDenom = wsCorrect + wsUncatalogued + wsMiscatalogued;
    perWorkspace.push({
      name: ws.name,
      relativePath: ws.relativePath,
      totalDeps: wsDenom,
      catalogedEligible: wsCorrect,
      percent: wsDenom > 0 ? Math.round((wsCorrect / wsDenom) * 100) : 100,
    });
  }

  // Add root to per-workspace stats
  let rootCorrect = 0;
  let rootUncatalogued = 0;
  let rootMiscatalogued = 0;
  const rootDepTypes = ["dependencies", "devDependencies"] as const;
  for (const depType of rootDepTypes) {
    const deps = rootJson[depType] || {};
    for (const [name, version] of Object.entries(deps)) {
      if (version.startsWith("workspace:") || name.startsWith("@sd/")) continue;
      const usesCatalog = version === "catalog:" || version.startsWith("catalog:");
      const isEligible = eligibleDepNames.has(name);
      if (isEligible && usesCatalog) rootCorrect++;
      else if (isEligible && !usesCatalog) rootUncatalogued++;
      else if (!isEligible && usesCatalog) rootMiscatalogued++;
    }
  }
  const rootDenom = rootCorrect + rootUncatalogued + rootMiscatalogued;
  perWorkspace.push({
    name: "root",
    relativePath: ".",
    totalDeps: rootDenom,
    catalogedEligible: rootCorrect,
    percent: rootDenom > 0 ? Math.round((rootCorrect / rootDenom) * 100) : 100,
  });

  let totalUnused = unusedDefault.length;
  for (const list of Object.values(unusedNamed)) totalUnused += list.length;

  const namedEntries = Object.entries(catalogs.named).map(([name, deps]) => ({
    name,
    entries: Object.keys(deps).length,
  }));

  return {
    overview: {
      totalWorkspaces: workspaces.length + 1,
      uniqueExternalDeps,
      eligibleDeps,
      correctlyCataloged,
      uncataloged,
      miscatalogued,
      coveragePercent,
    },
    entries: {
      default: Object.keys(catalogs.default).length,
      named: namedEntries,
      total: Object.keys(catalogs.default).length + namedEntries.reduce((s, g) => s + g.entries, 0),
    },
    perWorkspace: perWorkspace.sort((a, b) => a.relativePath.localeCompare(b.relativePath)),
    candidates: candidates.sort((a, b) => a.depName.localeCompare(b.depName)),
    unused: {
      default: unusedDefault,
      named: Object.entries(unusedNamed)
        .filter(([, list]) => list.length > 0)
        .map(([group, entries]) => ({ group, entries })),
      total: totalUnused,
    },
    alignment: {
      issues: issues.length,
      duplicates: duplicates.length,
    },
  };
}
