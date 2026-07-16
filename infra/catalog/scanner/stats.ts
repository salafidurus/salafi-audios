import { parseCatalogs } from "../helpers";
import { getAllPackages } from "./shared";
import { runCatalogCheck } from "./check";
import { getUnusedCatalogEntries } from "./prune";
import type { CatalogStats } from "../types";

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
      const deps = (pkg.content as any)[depType] || {};
      for (const [name, version] of Object.entries(deps)) {
        if (version.startsWith("workspace:") || name.startsWith("@sd/")) continue;
        externalDepNames.add(name);

        if (version === "catalog:" || version.startsWith("catalog:")) {
          catalogedDepNames.add(name);
        }

        if (!depUsage.has(name)) depUsage.set(name, []);
        depUsage.get(name)!.push({ pkgName: pkg.name, version: version as string });
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
      const deps = (ws.content as any)[depType] || {};
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

  let rootCorrect = 0;
  let rootUncatalogued = 0;
  let rootMiscatalogued = 0;
  const rootDepTypes = ["dependencies", "devDependencies"] as const;
  for (const depType of rootDepTypes) {
    const deps = (rootJson as any)[depType] || {};
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
      named: Object.entries(unusedNamed).reduce<{ group: string; entries: string[] }[]>(
        (acc, [group, entries]) => {
          if (entries.length > 0) acc.push({ group, entries });
          return acc;
        },
        [],
      ),
      total: totalUnused,
    },
    alignment: {
      issues: issues.length,
      duplicates: duplicates.length,
    },
  };
}
