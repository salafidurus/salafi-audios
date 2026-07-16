import fs from "node:fs";
import path from "node:path";
import {
  parseCatalogs,
  loadConfig,
  getWorkspaces,
  getDependencyGroup,
  matchPattern,
} from "../helpers";
import type { PackageJson, CatalogConfigGroup } from "../types";

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

      const patternSet = new Set(patterns);
      const depTypes = ["dependencies", "devDependencies"] as const;
      for (const depType of depTypes) {
        const deps = (pkg.content as any)[depType] || {};
        for (const [name, version] of Object.entries(deps)) {
          if (version.startsWith("workspace:") || name.startsWith("@sd/")) continue;
          if (!patternSet.has(name)) continue;

          if (!catalogs.named[group.name][name]) {
            catalogs.named[group.name][name] = version as string;
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
        const deps = (pkg.content as any)[depType] || {};
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
          if (!(rootJson as any).workspaces?.catalogs?.[group.name]?.[name]) {
            if (!rootJson.workspaces) rootJson.workspaces = {};
            if (!(rootJson as any).workspaces.catalogs) (rootJson as any).workspaces.catalogs = {};
            if (!(rootJson as any).workspaces.catalogs[group.name])
              (rootJson as any).workspaces.catalogs[group.name] = {};
            (rootJson as any).workspaces.catalogs[group.name][name] = version;
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

  if ((rootJson as any).workspaces?.catalogs) {
    for (const group of Object.keys((rootJson as any).workspaces.catalogs)) {
      if (Object.keys((rootJson as any).workspaces.catalogs[group]).length === 0) {
        delete (rootJson as any).workspaces.catalogs[group];
        updatedFilesSet.add("root");
      }
    }
    if (Object.keys((rootJson as any).workspaces.catalogs).length === 0) {
      delete (rootJson as any).workspaces.catalogs;
    }
  }

  return { updatedFiles: [...updatedFilesSet] };
}
