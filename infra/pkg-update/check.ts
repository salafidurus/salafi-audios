import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { fetchLatestVersion } from "./utils/npm";
import { config, type PkupdateConfig } from "./pkg-update.config";
import type { UpdateCandidate } from "./utils/ui";

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

function isNewer(a: string, b: string): boolean {
  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((aParts[i] ?? 0) > (bParts[i] ?? 0)) return true;
    if ((aParts[i] ?? 0) < (bParts[i] ?? 0)) return false;
  }
  return false;
}

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
}

function matchesSkip(name: string, skip: string[]): boolean {
  return skip.some((s) => {
    if (s.endsWith("*")) return name.startsWith(s.slice(0, -1));
    return name === s;
  });
}

export async function checkCatalog(
  rootDir: string,
  cfg: PkupdateConfig,
): Promise<UpdateCandidate[]> {
  const rootPkg = readJson(resolve(rootDir, "package.json")); // nosemgrep
  const workspaces = rootPkg.workspaces as Record<string, unknown> | undefined;
  const catalog = (workspaces?.catalog ?? {}) as Record<string, string>;

  const entries = Object.entries(catalog).filter(([pkg]) => !matchesSkip(pkg, cfg.skip));

  const versions = await Promise.all(entries.map(([pkg]) => fetchLatestVersion(pkg)));

  const results: UpdateCandidate[] = [];
  for (let i = 0; i < entries.length; i++) {
    const [pkg, version] = entries[i]!;
    const latest = versions[i];
    if (!latest) continue;

    const raw = version.replace(/^[\^~>=<]+\s*/, "");
    if (latest === raw) continue;

    const group = filterByGroups(pkg, cfg.groups);
    results.push({
      type: "catalog",
      packageName: pkg,
      currentVersion: version,
      latestVersion: latest,
      group: group ?? undefined,
    });
  }
  return results;
}

export async function checkBun(rootDir: string): Promise<UpdateCandidate | null> {
  const rootPkg = readJson(resolve(rootDir, "package.json")); // nosemgrep
  const packageManager = rootPkg.packageManager as string | undefined;
  if (!packageManager) return null;

  const match = packageManager.match(/^bun@(\d+\.\d+\.\d+)/);
  if (!match) return null;

  const current = match[1]!;
  const latest = await fetchLatestVersion("bun");
  if (!latest || latest === current) return null;

  return {
    type: "bun",
    packageName: "bun",
    currentVersion: packageManager,
    latestVersion: `bun@${latest}`,
  };
}

export async function checkExpo(rootDir: string): Promise<UpdateCandidate | null> {
  const nativePkgPath = resolve(rootDir, "apps", "native", "package.json"); // nosemgrep
  if (!existsSync(nativePkgPath)) return null;

  const nativePkg = readJson(nativePkgPath);
  const deps = (nativePkg.dependencies ?? {}) as Record<string, string>;
  const current = deps.expo;
  if (!current) return null;

  const latest = await fetchLatestVersion("expo");
  if (!latest) return null;

  const raw = current.replace(/^[\^~]/, "");
  if (latest === raw) return null;

  return {
    type: "expo",
    packageName: "expo",
    currentVersion: current,
    latestVersion: latest,
  };
}

export async function checkAll(
  rootDir: string,
  cfg: PkupdateConfig = config,
): Promise<UpdateCandidate[]> {
  const results: UpdateCandidate[] = [];

  results.push(...(await checkCatalog(rootDir, cfg)));

  if (cfg.bun.enabled) {
    const bun = await checkBun(rootDir);
    if (bun) results.push(bun);
  }

  if (cfg.expo.enabled) {
    const expo = await checkExpo(rootDir);
    if (expo) results.push(expo);
  }

  return dedupeCandidates(results);
}
