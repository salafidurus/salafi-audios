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
    log("Cleaning existing out/ directory... Done");
  }

  // 3. Execute Turborepo prune to isolate target dependencies
  const turboVersion = await getTurboVersion(rootDir);
  const turboCmd = turboVersion ? `turbo@${turboVersion}` : "turbo";

  log(`Running turbo prune for "${target}" using turbo version: ${turboVersion || "latest"}...`);

  // Execute via Bun Shell; throws automatically if command fails
  await Bun.$`bunx ${turboCmd} prune ${target} --docker`;
  log(`Running turbo prune for "${target}"... Done`);

  // 4. Overwrite root with the pruned workspace closure
  log("Cleaving monorepo root...");
  overwriteRootWithPrunedWorkspace(rootDir, outDir);
  log("Cleaving monorepo root... Done");

  // 5. Strip lifecycle scripts from the pruned root package.json.
  //    turbo prune --docker does not include scripts/ or .git/, so
  //    postinstall and prepare (husky) would fail in the deploy env.
  log("Stripping lifecycle scripts...");
  const pkgPath = path.join(rootDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  if (pkg.scripts) {
    delete pkg.scripts.postinstall;
    delete pkg.scripts.prepare;
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  log("Stripping lifecycle scripts... Done");

  // 6. Clean installation of pruned dependencies.
  //    turbo prune copies bun.lock with stale alias entries that break
  //    --frozen-lockfile on a subset of workspaces, so we let bun
  //    reconcile them in a non-frozen pass first.
  log("Installing pruned dependency closure...");
  await Bun.$`bun install`.cwd(rootDir);
  log("Installing pruned dependency closure... Done");

  log("Verifying lockfile consistency...");
  await Bun.$`bun install --frozen-lockfile`.cwd(rootDir);
  log("Verifying lockfile consistency... Done");

  // 7. Write marker file so the build step knows we are pruned
  fs.writeFileSync(path.join(rootDir, ".pruned-target"), target);

  success(`Install and prune process completed successfully for "${target}"!`);
} catch (err) {
  error(`Install failed: ${err.message}`);
  process.exit(1);
}
