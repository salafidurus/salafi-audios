import fs from "node:fs";
import path from "node:path";

import type {
  PackageJson,
  CatalogConfigGroup,
  CatalogRepairMutation,
  CatalogRepairReport,
} from "../types";

import {
  parseCatalogs,
  loadConfig,
  getWorkspaces,
  getDependencyGroup,
  sanitizeGroupName,
} from "../helpers";
import { resolveCatalogPolicy } from "../policy";
import { type DepUsage } from "./shared";

export interface CatalogFixOptions {
  /** Runs the repair calculation without writing catalog or manifest files. */
  dryRun?: boolean;
  /** Supplies the already-authorized catalog policy instead of reading legacy config. */
  config?: import("../types").CatalogConfig;
}

export interface CatalogFixResult {
  updatedFiles: string[];
  report: CatalogRepairReport;
}

export function runCatalogFix(rootDir: string, options: CatalogFixOptions = {}): CatalogFixResult {
  const dryRun = options.dryRun ?? false;
  const rootJsonPath = path.join(rootDir, "package.json");
  const rootJson: PackageJson = JSON.parse(fs.readFileSync(rootJsonPath, "utf-8"));
  const catalogs = parseCatalogs(rootJson);
  const originalDefaultCatalog = { ...catalogs.default };
  const originalNamedCatalogs = Object.fromEntries(
    Object.entries(catalogs.named).map(([name, entries]) => [name, { ...entries }]),
  );
  const config = options.config ?? loadConfig(rootDir);
  const workspaces = getWorkspaces(rootDir);
  const updatedFilesSet = new Set<string>();
  let policyError: string | undefined;

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

  const explicitDeps: DepUsage[] = [];

  for (const pkg of allWorkspacePkgs) {
    const depTypes = ["dependencies", "devDependencies"] as const;
    for (const depType of depTypes) {
      const deps = (pkg.content as any)[depType] || {};
      for (const [name, version] of Object.entries(deps)) {
        const v = version as string;
        if (v.startsWith("workspace:") || name.startsWith("@sd/")) continue;
        if (v.startsWith("catalog:")) continue;
        explicitDeps.push({
          depName: name,
          version: v,
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
    const usages = depsByName.get(dep.depName);
    if (usages) usages.push(dep);
  }

  // Step 1: Explicit deps processing — catalog deps used by 2+ workspaces
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
        const version = unmatched[0]!.version;
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

        const canonicalVersion = sorted[0]![0];
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

  // Step 2: Apply catalog updates to in-memory catalogs (for force-align lookup)
  for (const [depName, version] of defaultCatalogUpdates) {
    catalogs.default[depName] = version;
  }
  for (const [groupName, deps] of namedCatalogUpdates) {
    if (!catalogs.named[groupName]) catalogs.named[groupName] = {};
    for (const [depName, version] of deps) {
      catalogs.named[groupName][depName] = version;
    }
  }

  // Step 3: Align remaining explicit deps only when an explicit managed policy authorizes it.
  const trackedRefs = new Set(refUpdates.map((r) => `${r.pkgName}:${r.depName}`));
  for (const pkg of allWorkspacePkgs) {
    const depTypes = ["dependencies", "devDependencies"] as const;
    for (const depType of depTypes) {
      const deps = (pkg.content as any)[depType] || {};
      for (const [name, version] of Object.entries(deps)) {
        const v = version as string;
        if (v.startsWith("workspace:") || name.startsWith("@sd/")) continue;
        if (v.startsWith("catalog:")) continue;
        if (trackedRefs.has(`${pkg.name}:${name}`)) continue;
        const policy = resolveCatalogPolicy(name, pkg.relativePath, depType, config);
        if (policy.status === "ambiguous") {
          policyError = policy.reason;
          continue;
        }
        if (policy.status !== "matched" || policy.rule?.mode !== "managed") continue;
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

  if (policyError) return createFixResult(dryRun, [], [], policyError, "rejected");

  // Step 4: Build set of force-aligned deps that should not be orphaned
  const forceAlignedDeps = new Set<string>();
  for (const ref of refUpdates) {
    if (ref.newRef.startsWith("catalog:")) {
      forceAlignedDeps.add(ref.depName);
    }
  }

  // Step 5: Orphan resolution — remove catalog entries for deps used by <2 packages
  const allDepPkgs = new Map<string, Set<string>>();
  for (const pkg of allWorkspacePkgs) {
    const depTypes = ["dependencies", "devDependencies"] as const;
    for (const depType of depTypes) {
      const deps = (pkg.content as any)[depType] || {};
      for (const [name] of Object.entries(deps)) {
        if (name.startsWith("@sd/")) continue;
        if (!allDepPkgs.has(name)) allDepPkgs.set(name, new Set());
        allDepPkgs.get(name)!.add(pkg.name);
      }
    }
  }

  const orphanRemovals: { depName: string; version: string; group: string | null }[] = [];
  for (const [name, version] of Object.entries(catalogs.default)) {
    if (forceAlignedDeps.has(name)) continue;
    const pkgs = allDepPkgs.get(name);
    if (pkgs && pkgs.size >= 2) continue;
    orphanRemovals.push({ depName: name, version, group: null });
  }
  for (const [groupName, groupDeps] of Object.entries(catalogs.named)) {
    for (const [name, version] of Object.entries(groupDeps)) {
      if (forceAlignedDeps.has(name)) continue;
      const pkgs = allDepPkgs.get(name);
      if (pkgs && pkgs.size >= 2) continue;
      orphanRemovals.push({ depName: name, version, group: groupName });
    }
  }

  for (const orphan of orphanRemovals) {
    if (orphan.group) {
      if ((rootJson as any).workspaces?.catalogs?.[orphan.group]) {
        delete (rootJson as any).workspaces.catalogs[orphan.group][orphan.depName];
      }
    } else {
      if (rootJson.workspaces?.catalog) {
        delete rootJson.workspaces.catalog[orphan.depName];
      }
    }
    for (const pkg of allWorkspacePkgs) {
      const depTypes = ["dependencies", "devDependencies"] as const;
      for (const depType of depTypes) {
        const deps = (pkg.content as any)[depType] || {};
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

  // Step 6: Early return if nothing to do
  if (
    refUpdates.length === 0 &&
    defaultCatalogUpdates.size === 0 &&
    namedCatalogUpdates.size === 0 &&
    orphanRemovals.length === 0
  ) {
    let hadEmptyGroupCleanup = false;
    if ((rootJson as any).workspaces?.catalogs) {
      for (const group of Object.keys((rootJson as any).workspaces.catalogs)) {
        if (Object.keys((rootJson as any).workspaces.catalogs[group]).length === 0) {
          delete (rootJson as any).workspaces.catalogs[group];
          hadEmptyGroupCleanup = true;
        }
      }
      if (Object.keys((rootJson as any).workspaces.catalogs).length === 0) {
        delete (rootJson as any).workspaces.catalogs;
      }
    }
    if (hadEmptyGroupCleanup) {
      if (!dryRun) fs.writeFileSync(rootJsonPath, JSON.stringify(rootJson, null, 2) + "\n");
      return createFixResult(dryRun, ["root"], [], "empty catalog groups removed");
    }
    return createFixResult(dryRun, [], [], "catalogs are already aligned");
  }

  // Step 7: Clean up empty named catalog groups
  if ((rootJson as any).workspaces?.catalogs) {
    for (const group of Object.keys((rootJson as any).workspaces.catalogs)) {
      if (Object.keys((rootJson as any).workspaces.catalogs[group]).length === 0) {
        delete (rootJson as any).workspaces.catalogs[group];
      }
    }
    if (Object.keys((rootJson as any).workspaces.catalogs).length === 0) {
      delete (rootJson as any).workspaces.catalogs;
    }
  }

  if (orphanRemovals.length > 0) {
    updatedFilesSet.add("root");
  }

  if (defaultCatalogUpdates.size > 0 || namedCatalogUpdates.size > 0) {
    if (!rootJson.workspaces) rootJson.workspaces = {};
    if (!rootJson.workspaces.catalog) rootJson.workspaces.catalog = {};
    if (!(rootJson as any).workspaces.catalogs) (rootJson as any).workspaces.catalogs = {};

    for (const [depName, version] of defaultCatalogUpdates) {
      rootJson.workspaces.catalog[depName] = version;
    }

    for (const [groupName, deps] of namedCatalogUpdates) {
      if (!(rootJson as any).workspaces.catalogs[groupName]) {
        (rootJson as any).workspaces.catalogs[groupName] = {};
      }
      for (const [depName, version] of deps) {
        (rootJson as any).workspaces.catalogs[groupName][depName] = version;
      }
    }

    if (!dryRun) fs.writeFileSync(rootJsonPath, JSON.stringify(rootJson, null, 2) + "\n");
    updatedFilesSet.add("root");
  } else if (orphanRemovals.length > 0) {
    if (!dryRun) fs.writeFileSync(rootJsonPath, JSON.stringify(rootJson, null, 2) + "\n");
    updatedFilesSet.add("root");
  }

  if (configGroupEntries.size > 0) {
    const configGroups: CatalogConfigGroup[] = [...config.groups];
    const existingGroupNames = new Set(config.groups.map((g) => g.name));

    for (const [groupName, data] of configGroupEntries) {
      if (!existingGroupNames.has(groupName)) {
        configGroups.push({
          name: groupName,
          packages: [...data.packages].toSorted(),
          workspaces: [...data.workspaces].toSorted(),
        });
      }
    }

    if (!dryRun) {
      fs.writeFileSync(
        path.join(rootDir, "catalog.config.json"),
        JSON.stringify(
          {
            groups: configGroups,
            policies: config.policies,
            compatibilityGroups: config.compatibilityGroups ?? [],
          },
          null,
          2,
        ) + "\n",
      );
    }
    updatedFilesSet.add("catalog.config.json");
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
    if (!dryRun) fs.writeFileSync(update.filePath, JSON.stringify(raw, null, 2) + "\n");
    updatedFilesSet.add(pkgName);
  }

  const mutations: CatalogRepairMutation[] = refUpdates.map((update) => {
    const packageState = allWorkspacePkgs.find((pkg) => pkg.filePath === update.filePath);
    const before =
      (packageState?.content as any)?.[update.depType]?.[update.depName] ?? "<missing>";
    const policy = resolveCatalogPolicy(
      update.depName,
      packageState?.relativePath ?? "",
      update.depType,
      config,
    );
    const catalogGroup = update.newRef.startsWith("catalog:")
      ? update.newRef.slice("catalog:".length)
      : "";
    return {
      filePath: update.filePath,
      workspace: update.pkgName,
      dependency: update.depName,
      section: update.depType,
      before,
      after: update.newRef,
      rule:
        policy.status === "matched"
          ? policy.rule?.name
          : catalogGroup
            ? `catalog:${catalogGroup}`
            : "default-catalog",
      reason:
        policy.status === "matched"
          ? policy.reason
          : "catalog alignment authorized by the repair policy",
    };
  });

  for (const [dependency, after] of Object.entries(catalogs.default)) {
    if (originalDefaultCatalog[dependency] !== after) {
      mutations.push({
        filePath: rootJsonPath,
        workspace: "root",
        dependency,
        section: "dependencies",
        before: originalDefaultCatalog[dependency] ?? "<missing>",
        after,
        rule: "default-catalog",
        reason: "default Bun catalog update",
      });
    }
  }

  for (const [group, entries] of Object.entries(catalogs.named)) {
    for (const [dependency, after] of Object.entries(entries)) {
      if (originalNamedCatalogs[group]?.[dependency] !== after) {
        mutations.push({
          filePath: rootJsonPath,
          workspace: `catalog:${group}`,
          dependency,
          section: "dependencies",
          before: originalNamedCatalogs[group]?.[dependency] ?? "<missing>",
          after,
          rule: `catalog:${group}`,
          reason: `named Bun catalog '${group}' update`,
        });
      }
    }
  }

  return createFixResult(dryRun, [...updatedFilesSet], mutations);
}

function createFixResult(
  dryRun: boolean,
  updatedFiles: string[],
  mutations: CatalogRepairMutation[],
  reason?: string,
  forcedStatus?: CatalogRepairReport["status"],
): CatalogFixResult {
  return {
    updatedFiles,
    report: {
      status:
        forcedStatus ?? (updatedFiles.length === 0 ? "no-op" : dryRun ? "planned" : "applied"),
      mutations,
      updatedFiles,
      issues: [],
      reason,
      lockfile: updatedFiles.length === 0 ? "unchanged" : "requires-install",
    },
  };
}
