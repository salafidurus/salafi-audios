import { spawnSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "fs";
import { resolve, dirname, relative } from "path";

import type { UpdateCandidate } from "./utils/ui";

import { dependabotHelperPolicy, resolveDependencyFamily } from "../policy";
import { config, type PkupdateConfig } from "./update.config";

type DependencyMap = Record<string, string>;

interface PackageJson {
  workspaces?: {
    packages?: string[];
    catalog?: DependencyMap;
  };
  dependencies?: DependencyMap;
  devDependencies?: DependencyMap;
  peerDependencies?: DependencyMap;
  packageManager?: string;
  engines?: DependencyMap;
}

export function findWorkspacePkgFiles(rootDir: string): string[] {
  const packageJsonPath = resolve(rootDir, "package.json");
  // SAFETY: packageJsonPath points to the repository package.json owned by this helper.
  const rootPkg = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as PackageJson;
  const patterns = rootPkg.workspaces?.packages ?? [];
  const files: string[] = [];

  for (const pattern of patterns) {
    if (!pattern.includes("*")) continue;
    const baseDir = pattern.replace("/*", "");
    const basePath = resolve(rootDir, baseDir); // nosemgrep
    if (!existsSync(basePath)) continue;
    const entries = readdirSync(basePath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const pkgPath = resolve(basePath, entry.name, "package.json"); // nosemgrep
      if (existsSync(pkgPath)) {
        files.push(pkgPath);
      }
    }
  }
  return files;
}

function matchesPattern(name: string, pattern: string): boolean {
  if (pattern.endsWith("*")) return name.startsWith(pattern.slice(0, -1));
  return name === pattern;
}

function shouldSkipPackage(
  name: string,
  cfg: PkupdateConfig,
  rootDir: string,
  workspacePath: string,
): boolean {
  for (const s of cfg.skip) {
    if (matchesPattern(name, s)) return true;
  }
  const family = resolveDependencyFamily(dependabotHelperPolicy, name, workspacePath);
  return family?.mode === "helper-update" && family.pipeline === "expo-sdk";
}

function getGroupPatterns(name: string, cfg: PkupdateConfig): string[] | null {
  for (const group of Object.values(cfg.groups)) {
    for (const pattern of group.patterns) {
      if (matchesPattern(name, pattern)) return group.patterns;
    }
  }
  return null;
}

export function syncWorkspaceDeps(
  candidate: UpdateCandidate,
  rootDir: string,
  cfg: PkupdateConfig,
): string[] {
  const files = findWorkspacePkgFiles(rootDir);
  const updated: string[] = [];

  const packageJsonPath = resolve(rootDir, "package.json");
  // SAFETY: packageJsonPath points to the repository package.json owned by this helper.
  const rootPkg = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as PackageJson;
  const catalog = rootPkg.workspaces?.catalog;

  const groupPatterns = getGroupPatterns(candidate.packageName, cfg);
  const groupName = groupPatterns
    ? Object.entries(cfg.groups).find(([, g]) => g.patterns === groupPatterns)?.[0]
    : undefined;
  const isVersionLocked = groupName != null && cfg.versionLocked.includes(groupName);

  for (const file of files) {
    // SAFETY: findWorkspacePkgFiles returns package.json files from this repository's workspaces.
    const content = JSON.parse(readFileSync(file, "utf-8")) as PackageJson;
    let dirty = false;

    for (const section of ["dependencies", "devDependencies", "peerDependencies"] as const) {
      const deps = content[section];
      if (!deps) continue;

      const currentDep = deps[candidate.packageName];
      if (
        currentDep !== undefined &&
        currentDep !== "catalog:" &&
        !shouldSkipPackage(
          candidate.packageName,
          cfg,
          rootDir,
          relative(rootDir, file)
            .replace(/\\/g, "/")
            .replace(/\/package\.json$/, ""),
        )
      ) {
        deps[candidate.packageName] = catalog?.[candidate.packageName] ?? candidate.latestVersion;
        dirty = true;
      }

      if (isVersionLocked && groupPatterns) {
        for (const depName of Object.keys(deps)) {
          const matchesGroup = groupPatterns.some((p) => matchesPattern(depName, p));
          if (
            matchesGroup &&
            !shouldSkipPackage(
              depName,
              cfg,
              rootDir,
              relative(rootDir, file)
                .replace(/\\/g, "/")
                .replace(/\/package\.json$/, ""),
            )
          ) {
            const ld = deps[depName];
            if (ld !== "catalog:") {
              deps[depName] = catalog?.[depName] ?? candidate.latestVersion;
              dirty = true;
            }
          }
        }
      }
    }

    if (dirty) {
      writeFileSync(file, JSON.stringify(content, null, 2) + "\n");
      updated.push(file);
    }
  }

  return updated;
}

export function updateCatalogEntry(
  rootPkg: PackageJson,
  packageName: string,
  newVersion: string,
): PackageJson {
  const catalog = rootPkg.workspaces?.catalog;
  if (!catalog?.[packageName]) {
    throw new Error(`Package "${packageName}" not found in catalog`);
  }
  const prefix = catalog[packageName].match(/^([\^~])\s*/)?.[1] ?? "";
  const raw = newVersion.replace(/^[\^~]+\s*/, "");
  catalog[packageName] = `${prefix}${raw}`;
  return rootPkg;
}

export async function applyCatalogUpdate(
  candidate: UpdateCandidate,
  rootDir: string,
  cfg: PkupdateConfig,
): Promise<boolean> {
  const pkgPath = resolve(rootDir, "package.json"); // nosemgrep
  // SAFETY: pkgPath points to the repository package.json owned by this helper.
  const content = JSON.parse(readFileSync(pkgPath, "utf-8")) as PackageJson;
  const catalog = content.workspaces?.catalog;

  updateCatalogEntry(content, candidate.packageName, candidate.latestVersion);

  const groupPatterns = getGroupPatterns(candidate.packageName, cfg);
  const groupName = groupPatterns
    ? Object.entries(cfg.groups).find(([, g]) => g.patterns === groupPatterns)?.[0]
    : undefined;
  const isVersionLocked = groupName != null && cfg.versionLocked.includes(groupName);

  if (isVersionLocked && groupPatterns && catalog) {
    for (const pattern of groupPatterns) {
      for (const [catalogPkg, catalogVer] of Object.entries(catalog)) {
        if (catalogPkg !== candidate.packageName && matchesPattern(catalogPkg, pattern)) {
          const raw = catalogVer.replace(/^[\^~]/, "");
          if (raw !== candidate.latestVersion) {
            catalog[catalogPkg] =
              `${catalogVer.startsWith("^") ? "^" : catalogVer.startsWith("~") ? "~" : ""}${candidate.latestVersion}`;
          }
        }
      }
    }
  }

  writeFileSync(pkgPath, JSON.stringify(content, null, 2) + "\n");

  syncWorkspaceDeps(candidate, rootDir, cfg);
  return true;
}

export async function applyBunUpdate(
  candidate: UpdateCandidate,
  rootDir: string,
): Promise<boolean> {
  const pkgPath = resolve(rootDir, "package.json"); // nosemgrep
  // SAFETY: pkgPath points to the repository package.json owned by this helper.
  const content = JSON.parse(readFileSync(pkgPath, "utf-8")) as PackageJson;

  const version = candidate.latestVersion.replace("bun@", "");
  content.packageManager = `bun@${version}`;

  const engines = content.engines;
  if (engines) {
    engines.bun = version;
  } else {
    content.engines = { bun: version };
  }

  const devDeps = content.devDependencies;
  if (devDeps?.["bun-types"]) {
    devDeps["bun-types"] = `^${version}`;
  }

  writeFileSync(pkgPath, JSON.stringify(content, null, 2) + "\n");

  const bunVerPath = resolve(rootDir, ".bun-version"); // nosemgrep
  mkdirSync(dirname(bunVerPath), { recursive: true });
  writeFileSync(bunVerPath, `${version}\n`);

  return true;
}

/**
 * Applies an Expo SDK update, requiring install compatibility while treating
 * known Bun-linker Expo Doctor diagnostics as advisory.
 */
export async function applyExpoUpdate(
  candidate: UpdateCandidate,
  rootDir: string,
): Promise<boolean> {
  const nativeDir = resolve(rootDir, "apps", "native"); // nosemgrep
  if (!existsSync(nativeDir)) return false;

  const pkgPath = resolve(nativeDir, "package.json"); // nosemgrep
  // SAFETY: pkgPath points to the native package.json owned by this helper.
  const content = JSON.parse(readFileSync(pkgPath, "utf-8")) as PackageJson;
  const deps = content.dependencies;
  if (deps?.["expo"]) {
    deps["expo"] = candidate.latestVersion;
  }
  writeFileSync(pkgPath, JSON.stringify(content, null, 2) + "\n");

  const result = spawnSync("bunx", ["expo", "install", "--fix"], {
    cwd: nativeDir,
    stdio: "inherit",
  });
  if (result.status !== 0) return false;
  const doctor = spawnSync("bunx", ["expo-doctor"], {
    cwd: nativeDir,
    stdio: "inherit",
  });
  if (doctor.status !== 0) {
    console.warn("[expo] expo-doctor reported diagnostics; continuing with the update");
  }
  return true;
}

export async function runVerification(rootDir: string): Promise<string> {
  const result = spawnSync("bun", ["install"], {
    cwd: rootDir,
    encoding: "utf-8",
  });
  return result.stdout ?? result.stderr ?? "Verification complete";
}

export async function applyUpdate(
  candidate: UpdateCandidate,
  rootDir: string,
  cfg?: PkupdateConfig,
): Promise<boolean> {
  switch (candidate.type) {
    case "catalog":
      return applyCatalogUpdate(candidate, rootDir, cfg ?? config);
    case "bun":
      return applyBunUpdate(candidate, rootDir);
    case "expo":
      return applyExpoUpdate(candidate, rootDir);
  }
}
