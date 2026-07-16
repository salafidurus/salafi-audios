import { describe, it, expect } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  readCache,
  writeCache,
  mergeCache,
  updateCacheFromBatch,
  areAllCandidatesCached,
  type DepsCache,
} from "./cache";

function emptyCache(): DepsCache {
  return { version: 1, packages: {}, batches: {}, updatedAt: "" };
}

describe("readCache", () => {
  it("returns empty cache when file does not exist", () => {
    const dir = mkdtempSync(join(tmpdir(), "cache-test-"));
    const cache = readCache(dir);
    expect(cache.version).toBe(1);
    expect(cache.packages).toEqual({});
  });

  it("returns empty cache on corrupt JSON", () => {
    const dir = mkdtempSync(join(tmpdir(), "cache-test-"));
    mkdirSync(join(dir, ".cache"), { recursive: true });
    writeFileSync(join(dir, ".cache", "deps-state.json"), "not-json");
    const cache = readCache(dir);
    expect(cache.packages).toEqual({});
  });

  it("reads existing cache", () => {
    const dir = mkdtempSync(join(tmpdir(), "cache-test-"));
    mkdirSync(join(dir, ".cache"), { recursive: true });
    writeFileSync(
      join(dir, ".cache", "deps-state.json"),
      JSON.stringify({
        version: 1,
        packages: { zod: { latestVersion: "4.4.3" } },
        batches: {},
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    const cache = readCache(dir);
    expect(cache.packages.zod?.latestVersion).toBe("4.4.3");
  });

  it("returns empty cache on version mismatch", () => {
    const dir = mkdtempSync(join(tmpdir(), "cache-test-"));
    mkdirSync(join(dir, ".cache"), { recursive: true });
    writeFileSync(
      join(dir, ".cache", "deps-state.json"),
      JSON.stringify({ version: 999, packages: {} }),
    );
    const cache = readCache(dir);
    expect(cache.packages).toEqual({});
  });
});

describe("writeCache", () => {
  it("writes cache to .cache/deps-state.json", () => {
    const dir = mkdtempSync(join(tmpdir(), "cache-test-"));
    const cache: DepsCache = {
      version: 1,
      packages: { zod: { latestVersion: "4.4.3" } },
      batches: {},
      updatedAt: "",
    };
    writeCache(dir, cache);
    const path = join(dir, ".cache", "deps-state.json");
    expect(existsSync(path)).toBe(true);
    const raw = JSON.parse(readFileSync(path, "utf-8")) as DepsCache;
    expect(raw.packages.zod?.latestVersion).toBe("4.4.3");
  });
});

describe("mergeCache", () => {
  it("merges old and new packages, new wins on conflict", () => {
    const old: DepsCache = {
      version: 1,
      packages: { a: { latestVersion: "1.0.0" }, b: { latestVersion: "2.0.0" } },
      batches: {},
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const fresh: DepsCache = {
      version: 1,
      packages: { b: { latestVersion: "3.0.0" }, c: { latestVersion: "4.0.0" } },
      batches: {},
      updatedAt: "2026-06-01T00:00:00.000Z",
    };
    const merged = mergeCache(old, fresh);
    expect(merged.packages.a?.latestVersion).toBe("1.0.0");
    expect(merged.packages.b?.latestVersion).toBe("3.0.0");
    expect(merged.packages.c?.latestVersion).toBe("4.0.0");
  });
});

describe("updateCacheFromBatch", () => {
  it("adds packages and batch entry", () => {
    const cache = emptyCache();
    updateCacheFromBatch(
      cache,
      [
        { packageName: "zod", latestVersion: "4.4.3" },
        { packageName: "react", latestVersion: "19.0.0" },
      ],
      "ungrouped",
      42,
    );
    expect(cache.packages.zod?.latestVersion).toBe("4.4.3");
    expect(cache.packages.react?.latestVersion).toBe("19.0.0");
    expect(cache.batches.ungrouped?.prNumber).toBe(42);
  });

  it("handles prNumber null", () => {
    const cache = emptyCache();
    updateCacheFromBatch(cache, [{ packageName: "zod", latestVersion: "4.4.3" }], "zod", null);
    expect(cache.batches.zod?.prNumber).toBeNull();
  });
});

describe("areAllCandidatesCached", () => {
  it("returns true when all candidates are cached at same versions", () => {
    const cache = emptyCache();
    cache.packages.zod = { latestVersion: "4.4.3" };
    cache.packages.react = { latestVersion: "19.0.0" };
    expect(
      areAllCandidatesCached(
        [
          { packageName: "zod", latestVersion: "4.4.3" },
          { packageName: "react", latestVersion: "19.0.0" },
        ],
        cache,
      ),
    ).toBe(true);
  });

  it("returns false when candidate is not in cache", () => {
    expect(
      areAllCandidatesCached([{ packageName: "zod", latestVersion: "4.4.3" }], emptyCache()),
    ).toBe(false);
  });

  it("returns false when version differs", () => {
    const cache = emptyCache();
    cache.packages.zod = { latestVersion: "3.0.0" };
    expect(areAllCandidatesCached([{ packageName: "zod", latestVersion: "4.4.3" }], cache)).toBe(
      false,
    );
  });

  it("returns false for empty candidates", () => {
    expect(areAllCandidatesCached([], emptyCache())).toBe(false);
  });
});
