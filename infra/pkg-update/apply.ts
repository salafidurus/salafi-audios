import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { spawnSync } from "child_process";
import type { UpdateCandidate } from "./utils/ui";

export function updateCatalogEntry(
  rootPkg: Record<string, unknown>,
  packageName: string,
  newVersion: string,
): Record<string, unknown> {
  const workspaces = rootPkg.workspaces as Record<string, unknown> | undefined;
  const catalog = workspaces?.catalog as Record<string, string> | undefined;
  if (!catalog?.[packageName]) {
    throw new Error(`Package "${packageName}" not found in catalog`);
  }
  catalog[packageName] = newVersion;
  return rootPkg;
}

export async function applyCatalogUpdate(
  candidate: UpdateCandidate,
  rootDir: string,
): Promise<boolean> {
  const pkgPath = resolve(rootDir, "package.json"); // nosemgrep
  const content = JSON.parse(readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
  updateCatalogEntry(content, candidate.packageName, candidate.latestVersion);
  writeFileSync(pkgPath, JSON.stringify(content, null, 2) + "\n");
  return true;
}

export async function applyBunUpdate(
  candidate: UpdateCandidate,
  rootDir: string,
): Promise<boolean> {
  const pkgPath = resolve(rootDir, "package.json"); // nosemgrep
  const content = JSON.parse(readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;

  const version = candidate.latestVersion.replace("bun@", "");
  content.packageManager = `bun@${version}`;

  const devDeps = content.devDependencies as Record<string, string> | undefined;
  if (devDeps?.["bun-types"]) {
    devDeps["bun-types"] = `^${version}`;
  }

  writeFileSync(pkgPath, JSON.stringify(content, null, 2) + "\n");
  return true;
}

export async function applyExpoUpdate(rootDir: string): Promise<boolean> {
  const nativeDir = resolve(rootDir, "apps", "native"); // nosemgrep
  if (!existsSync(nativeDir)) return false;

  const result = spawnSync("bun", ["expo", "install", "--fix"], {
    cwd: nativeDir,
    stdio: "inherit",
  });
  return result.status === 0;
}

export async function runVerification(rootDir: string): Promise<string> {
  const result = spawnSync("bun", ["install"], {
    cwd: rootDir,
    encoding: "utf-8",
  });
  return result.stdout ?? result.stderr ?? "Verification complete";
}

export async function applyUpdate(candidate: UpdateCandidate, rootDir: string): Promise<boolean> {
  switch (candidate.type) {
    case "catalog":
      return applyCatalogUpdate(candidate, rootDir);
    case "bun":
      return applyBunUpdate(candidate, rootDir);
    case "expo":
      return applyExpoUpdate(rootDir);
  }
}
