import fs from "node:fs";
import path from "node:path";
import { log } from "./logging.mjs";

/**
 * Cleaves directories that might pollute dependency resolution and overwrites
 * the root monorepo files with pruned workspaces.
 * @param {string} rootDir The monorepo root directory.
 * @param {string} outDir The turbo prune out directory.
 */
export function overwriteRootWithPrunedWorkspace(rootDir, outDir) {
  const outJson = path.join(outDir, "json");
  const outFull = path.join(outDir, "full");

  if (!fs.existsSync(outJson) || !fs.existsSync(outFull)) {
    throw new Error("Pruned workspace folders are missing inside out/");
  }

  // Identify all unique top-level entries to copy from the pruned outputs
  const prunedEntries = new Set();
  fs.readdirSync(outJson).forEach((item) => prunedEntries.add(item));
  fs.readdirSync(outFull).forEach((item) => prunedEntries.add(item));

  log(`Cleaving monorepo root. Overwriting entries: ${Array.from(prunedEntries).join(", ")}`);

  // Delete node_modules in the root to ensure no dependency pollution/leakage
  log("Purging root node_modules for clean installation...");
  fs.rmSync(path.join(rootDir, "node_modules"), { recursive: true, force: true });

  // Copy pruned workspaces over the monorepo root
  for (const entry of prunedEntries) {
    const rootEntryPath = path.join(rootDir, entry);
    const fullPath = path.join(outFull, entry);
    const jsonPath = path.join(outJson, entry);

    // Determine if the entry represents a directory in the source folders
    const isDirectory =
      (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) ||
      (fs.existsSync(jsonPath) && fs.statSync(jsonPath).isDirectory());

    // Only delete directories to ensure stale workspaces are completely cleaned.
    // Files (like package.json) are overwritten directly to avoid Windows EPERM file lock errors.
    if (isDirectory) {
      fs.rmSync(rootEntryPath, { recursive: true, force: true });
    }

    // Copy full source directory/files
    if (fs.existsSync(fullPath)) {
      fs.cpSync(fullPath, rootEntryPath, { recursive: true });
    }

    // Overwrite with pruned package.json/lockfile descriptors
    if (fs.existsSync(jsonPath)) {
      fs.cpSync(jsonPath, rootEntryPath, { recursive: true });
    }
  }

  // Remove temporary out/ directory to clean up
  log("Cleaning up prune artifacts...");
  fs.rmSync(outDir, { recursive: true, force: true });
}
