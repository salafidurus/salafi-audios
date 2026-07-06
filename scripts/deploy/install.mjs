#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";
import { findMonorepoRoot } from "../utils/paths.mjs";
import { overwriteRootWithPrunedWorkspace } from "../utils/filesystem.mjs";
import { getTurboVersion, validateEnvironment } from "../utils/turbo.mjs";
import { log, error, success, setPrefix } from "../utils/logging.mjs";

setPrefix("[Deploy:Install]");

const target = process.argv[2];

if (target !== "web" && target !== "api") {
  error(`Invalid target "${target}". Supported targets are "web" and "api".`);
  process.exit(1);
}

try {
  log(`Starting install/prune process for target: "${target}"`);

  // 1. Resolve monorepo root and validate environment
  const rootDir = findMonorepoRoot();
  validateEnvironment();
  log(`Monorepo root resolved: ${rootDir}`);

  // 2. Clean previous build workspace output directory if exists
  const outDir = path.join(rootDir, "out");
  if (fs.existsSync(outDir)) {
    log("Cleaning existing out/ directory...");
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  // 3. Execute Turborepo prune to isolate target dependencies
  const turboVersion = await getTurboVersion(rootDir);
  const turboCmd = turboVersion ? `turbo@${turboVersion}` : "turbo";

  log(`Running turbo prune for "${target}" using turbo version: ${turboVersion || "latest"}`);

  // Execute via Bun Shell; throws automatically if command fails
  await Bun.$`bunx ${turboCmd} prune ${target} --docker`;

  // 4. Overwrite root with the pruned workspace closure
  overwriteRootWithPrunedWorkspace(rootDir, outDir);

  // 5. Clean installation of pruned dependencies in the workspace
  log("Installing pruned dependency closure...");
  await Bun.$.cwd(rootDir)`bun install --frozen-lockfile`;

  // 6. Write marker file so the build step knows we are pruned
  fs.writeFileSync(path.join(rootDir, ".pruned-target"), target);

  success(`Install and prune process completed successfully for "${target}"!`);
} catch (err) {
  error(`Install failed: ${err.message}`);
  process.exit(1);
}
