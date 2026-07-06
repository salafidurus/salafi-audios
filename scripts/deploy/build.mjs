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
      log("Cleaning existing out/ directory...");
      fs.rmSync(outDir, { recursive: true, force: true });
      log("Cleaning existing out/ directory... Done");
    }

    // Execute Turborepo prune
    const turboVersion = await getTurboVersion(rootDir);
    const turboCmd = turboVersion ? `turbo@${turboVersion}` : "turbo";
    log(`Running turbo prune for "${target}" using turbo version: ${turboVersion || "latest"}...`);
    await Bun.$`bunx ${turboCmd} prune ${target} --docker`;
    log(`Running turbo prune for "${target}"... Done`);

    // Overwrite root
    log("Cleaving monorepo root...");
    overwriteRootWithPrunedWorkspace(rootDir, outDir);
    log("Cleaving monorepo root... Done");

    // Strip lifecycle scripts from the pruned root package.json.
    // turbo prune --docker does not include scripts/ or .git/, so
    // postinstall and prepare (husky) would fail in the deploy env.
    log("Stripping lifecycle scripts...");
    const pkgPath = path.join(rootDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    if (pkg.scripts) {
      delete pkg.scripts.postinstall;
      delete pkg.scripts.prepare;
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    log("Stripping lifecycle scripts... Done");

    // Install pruned dependencies, then freeze-verify.
    log("Cleaning up lockfile stale workspace aliases...");
    await Bun.$`bun install --lockfile-only`.cwd(rootDir);
    log("Cleaning up lockfile stale workspace aliases... Done");

    log("Installing pruned dependency closure with frozen lockfile...");
    await Bun.$`bun install --frozen-lockfile`.cwd(rootDir);
    log("Installing pruned dependency closure with frozen lockfile... Done");

    // Write marker
    fs.writeFileSync(markerPath, target);
  }

  // Build the target application
  log(`Building application: "${target}"...`);
  await Bun.$.cwd(rootDir)`bun run build --filter=${target}...`;
  log(`Building application: "${target}"... Done`);

  log(`Bun version: ${process.versions.bun}`);
  success(`Build process completed successfully for "${target}"!`);
} catch (err) {
  error(`Build failed: ${err.stack || err.message || err}`);
  process.exit(1);
}
