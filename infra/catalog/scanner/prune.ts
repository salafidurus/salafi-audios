import fs from "node:fs";
import path from "node:path";
import { parseCatalogs } from "../helpers";
import { getAllPackages } from "./shared";

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
      const deps = (pkg.content as any)[depType] || {};
      for (const [name, version] of Object.entries(deps)) {
        if (version === "catalog:") {
          usedInDefault.add(name);
        } else if (version.startsWith("catalog:")) {
          const groupName = (version as string).split(":")[1];
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
