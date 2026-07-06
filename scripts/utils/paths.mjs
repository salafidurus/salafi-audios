import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Finds the monorepo root directory by traversing up from the current script location.
 * Assumes the root contains both bun.lock and turbo.json.
 * @returns {string} The absolute path to the monorepo root.
 */
export function findMonorepoRoot() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  let currentDir = __dirname;
  let depth = 0;
  const maxDepth = 5;

  while (currentDir !== path.dirname(currentDir) && depth < maxDepth) {
    if (
      fs.existsSync(path.join(currentDir, "bun.lock")) &&
      fs.existsSync(path.join(currentDir, "turbo.json"))
    ) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
    depth++;
  }
  throw new Error("Monorepo root not found (missing bun.lock and turbo.json)");
}
