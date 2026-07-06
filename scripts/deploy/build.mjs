#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";
import { findMonorepoRoot, runCommand, getTurboVersion } from "./utils.mjs";

const target = process.argv[2];

if (target !== "web" && target !== "api") {
  console.error(`[Deploy] Error: Invalid target "${target}". Supported targets are "web" and "api".`);
  process.exit(1);
}

console.log(`[Deploy] Starting build process for target: "${target}"`);

// 1. Resolve monorepo root and transition working directory
const rootDir = findMonorepoRoot();
process.chdir(rootDir);
console.log(`[Deploy] Monorepo root resolved: ${rootDir}`);

// 2. Clean previous build workspace output directory if exists
const outDir = path.join(rootDir, "out");
if (fs.existsSync(outDir)) {
  console.log("[Deploy] Cleaning existing out/ directory...");
  fs.rmSync(outDir, { recursive: true, force: true });
}

// 3. Execute Turborepo prune to isolate target dependencies
const turboVersion = await getTurboVersion(rootDir);
const pruneArgs = ["prune", target, "--docker"];
const turboCmd = turboVersion ? `turbo@${turboVersion}` : "turbo";

console.log(`[Deploy] Running turbo prune for "${target}" using turbo version: ${turboVersion || "latest"}`);
runCommand("bunx", [turboCmd, ...pruneArgs]);

// 4. Overwrite root with the pruned workspace closure
const outJson = path.join(outDir, "json");
const outFull = path.join(outDir, "full");

if (!fs.existsSync(outJson) || !fs.existsSync(outFull)) {
  console.error("[Deploy] Error: Pruned workspace folders are missing inside out/");
  process.exit(1);
}

// Identify all unique top-level entries to copy from the pruned outputs
const prunedEntries = new Set();
fs.readdirSync(outJson).forEach((item) => prunedEntries.add(item));
fs.readdirSync(outFull).forEach((item) => prunedEntries.add(item));

console.log(`[Deploy] Cleaving monorepo root. Overwriting entries: ${Array.from(prunedEntries).join(", ")}`);

// Delete node_modules in the root to ensure no dependency pollution/leakage
console.log("[Deploy] Purging root node_modules for clean installation...");
fs.rmSync(path.join(rootDir, "node_modules"), { recursive: true, force: true });

// Copy pruned workspaces over the monorepo root
for (const entry of prunedEntries) {
  const rootEntryPath = path.join(rootDir, entry);
  
  // Safely clean target destination path first
  fs.rmSync(rootEntryPath, { recursive: true, force: true });

  const fullPath = path.join(outFull, entry);
  const jsonPath = path.join(outJson, entry);

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
console.log("[Deploy] Cleaning up prune artifacts...");
fs.rmSync(outDir, { recursive: true, force: true });

// 5. Clean installation of pruned dependencies
console.log("[Deploy] Installing pruned dependency closure...");
runCommand("bun", ["install", "--frozen-lockfile"]);

// 6. Build the target application
console.log(`[Deploy] Building application: "${target}"`);
runCommand("bun", ["run", "build", `--filter=${target}...`]);

console.log(`[Deploy] Build process completed successfully for "${target}"!`);
