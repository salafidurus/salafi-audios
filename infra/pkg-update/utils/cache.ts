import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

export interface DepsCacheEntry {
  latestVersion: string;
}

export interface DepsCacheBatch {
  prNumber: number | null;
  updatedAt: string;
}

export interface DepsCache {
  version: 1;
  packages: Record<string, DepsCacheEntry>;
  batches: Record<string, DepsCacheBatch>;
  updatedAt: string;
}

const CACHE_FILE = ".cache/deps-state.json";

export function cachePath(rootDir: string): string {
  return resolve(rootDir, CACHE_FILE); // nosemgrep
}

export function readCache(rootDir: string): DepsCache {
  try {
    const raw = readFileSync(cachePath(rootDir), "utf-8");
    const parsed = JSON.parse(raw) as DepsCache;
    if (parsed.version === 1) return parsed;
  } catch {
    /* corrupt or missing cache */
  }
  return { version: 1, packages: {}, batches: {}, updatedAt: new Date().toISOString() };
}

export function writeCache(rootDir: string, cache: DepsCache): void {
  cache.updatedAt = new Date().toISOString();
  const path = cachePath(rootDir);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(cache, null, 2) + "\n");
}

export function mergeCache(old: DepsCache, updated: DepsCache): DepsCache {
  return {
    version: 1,
    packages: { ...old.packages, ...updated.packages },
    batches: { ...old.batches, ...updated.batches },
    updatedAt: new Date().toISOString(),
  };
}

export function updateCacheFromBatch(
  cache: DepsCache,
  candidates: { packageName: string; latestVersion: string }[],
  groupName: string,
  prNumber: number | null,
): void {
  for (const c of candidates) {
    cache.packages[c.packageName] = { latestVersion: c.latestVersion };
  }
  cache.batches[groupName] = { prNumber, updatedAt: new Date().toISOString() };
}

export function areAllCandidatesCached(
  candidates: { packageName: string; latestVersion: string }[],
  cache: DepsCache,
): boolean {
  return (
    candidates.length > 0 &&
    candidates.every((c) => cache.packages[c.packageName]?.latestVersion === c.latestVersion)
  );
}
