import { parseCatalogs, loadConfig, getDependencyGroup } from "../helpers";
import { getAllPackages } from "./shared";
import type { CatalogIssue, CatalogDuplicate } from "../types";

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
      const deps = (pkg.content as any)[depType] || {};
      for (const [name, version] of Object.entries(deps)) {
        if (version.startsWith("workspace:") || name.startsWith("@sd/")) continue;

        if (!depPackageSet.has(name)) depPackageSet.set(name, new Set());
        depPackageSet.get(name)!.add(pkg.name);

        if (!version.startsWith("catalog:")) {
          if (!dependencyMap[name]) {
            dependencyMap[name] = { workspaces: [], versions: [] };
          }
          dependencyMap[name].workspaces.push(pkg.name);
          dependencyMap[name].versions.push(version as string);
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
          const groupName = (version as string).split(":")[1];
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
          const v = version as string;

          if (groupName && catalogs.named[groupName]?.[name]) {
            const expected = catalogs.named[groupName][name];
            if (expected === v) {
              issues.push({
                type: "hardcoded",
                pkgName: pkg.name,
                depName: name,
                expectedVersion: expected,
                actualVersion: v,
                details: `'${pkg.name}': '${name}' specifies "${v}" explicitly but matches catalogs.${groupName} (should use "catalog:${groupName}")`,
              });
            } else {
              issues.push({
                type: "mismatch",
                pkgName: pkg.name,
                depName: name,
                expectedVersion: expected,
                actualVersion: v,
                details: `'${pkg.name}': '${name}' specifies "${v}" explicitly but catalogs.${groupName} has "${expected}"`,
              });
            }
          } else if (!groupName && catalogs.default[name]) {
            const expected = catalogs.default[name];
            if (expected === v) {
              issues.push({
                type: "hardcoded",
                pkgName: pkg.name,
                depName: name,
                expectedVersion: expected,
                actualVersion: v,
                details: `'${pkg.name}': '${name}' specifies "${v}" explicitly but matches default catalog (should use "catalog:")`,
              });
            } else {
              issues.push({
                type: "mismatch",
                pkgName: pkg.name,
                depName: name,
                expectedVersion: expected,
                actualVersion: v,
                details: `'${pkg.name}': '${name}' specifies "${v}" explicitly but default catalog has "${expected}"`,
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
