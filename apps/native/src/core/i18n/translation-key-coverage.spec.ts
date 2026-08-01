import { readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

const SRC_ROOT = resolve(__dirname, "../../");
const LOCALE_PATHS = {
  en: {
    shared: resolve(__dirname, "../../../../../packages/core-i18n/src/locales/en.json"),
    overrides: resolve(__dirname, "./overrides.en.json"),
  },
  ar: {
    shared: resolve(__dirname, "../../../../../packages/core-i18n/src/locales/ar.json"),
    overrides: resolve(__dirname, "./overrides.ar.json"),
  },
} as const;

const T_CALL_PATTERN = /(^|[^a-zA-Z0-9_.])t\("([a-zA-Z0-9_.]+)"/g;

function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
    } else if (
      /\.(ts|tsx)$/.test(entry) &&
      !/\.(spec|test)\.(ts|tsx)$/.test(entry) &&
      !entry.endsWith(".d.ts")
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractKeys(files: string[]): Set<string> {
  const keys = new Set<string>();
  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    for (const match of content.matchAll(T_CALL_PATTERN)) {
      keys.add(match[2]!);
    }
  }
  return keys;
}

function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>) {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const existing = result[key];
    if (
      existing &&
      typeof existing === "object" &&
      !Array.isArray(existing) &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      result[key] = deepMerge(
        existing as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

function resolveKey(resource: Record<string, unknown>, key: string): unknown {
  let node: unknown = resource;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return node;
}

describe("translation key coverage", () => {
  it.each(Object.entries(LOCALE_PATHS))(
    "every t() key referenced in apps/native resolves in the merged %s translation resource",
    (_locale, paths) => {
      const shared = JSON.parse(readFileSync(paths.shared, "utf-8"));
      const overrides = JSON.parse(readFileSync(paths.overrides, "utf-8"));
      const merged = deepMerge(shared, overrides);

      const files = collectSourceFiles(SRC_ROOT);
      const usedKeys = extractKeys(files);

      const missing = [...usedKeys]
        .filter((key) => typeof resolveKey(merged, key) !== "string")
        .sort();

      expect(missing).toEqual([]);
    },
  );
});
