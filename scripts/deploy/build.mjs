#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";
import { findMonorepoRoot } from "../utils/paths.mjs";
import { overwriteRootWithPrunedWorkspace } from "../utils/filesystem.mjs";
import { getTurboVersion, validateEnvironment } from "../utils/turbo.mjs";
import { log, error, success, setPrefix } from "../utils/logging.mjs";

setPrefix("[Deploy:Build]");

const target = process.argv[2];

if (target !== "web" && target !== "api") {
  error(`Invalid target "${target}". Supported targets are "web" and "api".`);
  process.exit(1);
}

try {
  log(`Starting build process for target: "${target}"`);

  const rootDir = findMonorepoRoot();
  validateEnvironment();
  log(`Monorepo root resolved: ${rootDir}`);

  const markerPath = path.join(rootDir, ".pruned-target");
  let isAlreadyPruned = false;

  if (fs.existsSync(markerPath)) {
    const prunedTarget = fs.readFileSync(markerPath, "utf8").trim();
    if (prunedTarget === target) {
      isAlreadyPruned = true;
    }
  }

  if (isAlreadyPruned) {
    log(`Pruned marker file found for target "${target}". Skipping prune and install phases.`);
  } else {
    log(`No pruned marker found for target "${target}". Running full prune and install sequence.`);

    // Clean out/
    const outDir = path.join(rootDir, "out");
    if (fs.existsSync(outDir)) {
      fs.rmSync(outDir, { recursive: true, force: true });
    }

    // Execute Turborepo prune
    const turboVersion = await getTurboVersion(rootDir);
    const turboCmd = turboVersion ? `turbo@${turboVersion}` : "turbo";
    await Bun.$`bunx ${turboCmd} prune ${target} --docker`;

    // Overwrite root
    overwriteRootWithPrunedWorkspace(rootDir, outDir);

    // Clean install
    log("Installing pruned dependencies...");
    await Bun.$.cwd(rootDir)`bun install --frozen-lockfile`;

    // Write marker
    fs.writeFileSync(markerPath, target);
  }

  // Build the target application
  log(`Building application: "${target}"`);
  await Bun.$.cwd(rootDir)`bun run build --filter=${target}...`;

  success(`Build process completed successfully for "${target}"!`);
} catch (err) {
  error(`Build failed: ${err.message}`);
  process.exit(1);
}
