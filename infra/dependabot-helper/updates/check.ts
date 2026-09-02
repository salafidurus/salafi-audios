import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

import type { UpdateCandidate } from "./utils/ui";

import { dependabotHelperPolicy, resolveDependencyFamily } from "../policy";
import { config, type PkupdateConfig } from "./update.config";
import { fetchLatestVersion } from "./utils/npm";
import { isNewer } from "./utils/semver";

type LatestVersionFetcher = (packageName: string) => Promise<string | null>;

type PackageJson = {
  workspaces?: { catalog?: Record<string, string> };
  packageManager?: string;
  dependencies?: Record<string, string>;
};

export function filterByGroups(depName: string, groups: PkupdateConfig["groups"]): string | null {
  for (const [groupName, group] of Object.entries(groups)) {
    for (const pattern of group.patterns) {
      const prefix = pattern.replace(/\*/g, "");
      if (depName === prefix || depName.startsWith(prefix)) return groupName;
    }
  }
  return null;
}

export function dedupeCandidates(candidates: UpdateCandidate[]): UpdateCandidate[] {
  const map = new Map<string, UpdateCandidate>();
  for (const c of candidates) {
    const key = `${c.type}:${c.packageName}`;
    const existing = map.get(key);
    if (!existing || isNewer(c.latestVersion, existing.latestVersion)) {
      map.set(key, c);
    }
  }
  return Array.from(map.values());
}

function readJson(path: string): PackageJson {
  // SAFETY: callers only read the optional package.json fields represented by this local shape.
  return JSON.parse(readFileSync(path, "utf-8")) as PackageJson;
}

/**
 * Returns no candidates because ordinary catalog versions belong to Dependabot.
 * Helper-owned updates must use their dedicated pipeline, while helper checks
 * validate state without selecting replacement versions.
 */
export async function checkCatalog(
  _rootDir: string,
  _cfg: PkupdateConfig,
  _fetcher: LatestVersionFetcher = fetchLatestVersion,
): Promise<UpdateCandidate[]> {
  return [];
}

export async function checkBun(
  rootDir: string,
  fetcher: LatestVersionFetcher = fetchLatestVersion,
): Promise<UpdateCandidate | null> {
  const rootPkg = readJson(resolve(rootDir, "package.json")); // nosemgrep
  const packageManager = rootPkg.packageManager;
  if (!packageManager) return null;

  const match = packageManager.match(/^bun@(\d+\.\d+\.\d+)/);
  if (!match) return null;

  // SAFETY: the capture group is present because the regular expression matched.
  const current = match[1]!;
  const latest = await fetcher("bun");
  if (!latest || latest === current) return null;

  return {
    type: "bun",
    packageName: "bun",
    currentVersion: packageManager,
    latestVersion: `bun@${latest}`,
  };
}

export async function checkExpo(
  rootDir: string,
  fetcher: LatestVersionFetcher = fetchLatestVersion,
): Promise<UpdateCandidate | null> {
  const nativePkgPath = resolve(rootDir, "apps", "native", "package.json"); // nosemgrep
  if (!existsSync(nativePkgPath)) return null;

  const nativePkg = readJson(nativePkgPath);
  const deps = nativePkg.dependencies ?? {};
  const current = deps.expo;
  if (!current) return null;

  const expoFamily = resolveDependencyFamily(dependabotHelperPolicy, "expo", "apps/native");
  const latest = expoFamily?.mode === "helper-update" ? await fetcher("expo") : null;
  if (!latest) return null;

  const raw = current.replace(/^[\^~]/, "");
  if (latest === raw) return null;

  return {
    type: "expo",
    packageName: "expo",
    currentVersion: current,
    latestVersion: latest,
    group: "expo",
  };
}

export async function checkAll(
  rootDir: string,
  cfg: PkupdateConfig = config,
  fetcher: LatestVersionFetcher = fetchLatestVersion,
): Promise<UpdateCandidate[]> {
  const results: UpdateCandidate[] = [];

  results.push(...(await checkCatalog(rootDir, cfg, fetcher)));

  if (cfg.bun.enabled) {
    const bun = await checkBun(rootDir, fetcher);
    if (bun) results.push(bun);
  }

  if (cfg.expo.enabled) {
    const expo = await checkExpo(rootDir, fetcher);
    if (expo) results.push(expo);
  }

  return dedupeCandidates(results);
}
