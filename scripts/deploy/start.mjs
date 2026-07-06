#!/usr/bin/env bun
import { findMonorepoRoot, runCommand } from "./utils.mjs";

const target = process.argv[2];

if (target !== "web" && target !== "api") {
  console.error(`[Deploy] Error: Invalid target "${target}". Supported targets are "web" and "api".`);
  process.exit(1);
}

console.log(`[Deploy] Starting application for target: "${target}"`);

const rootDir = findMonorepoRoot();
process.chdir(rootDir);

if (target === "api") {
  // Start the NestJS backend in production mode (compiled JS entry point)
  runCommand("bun", ["run", "--filter=api", "start:prod"]);
} else if (target === "web") {
  // Start the Next.js web application in production mode
  runCommand("bun", ["run", "--filter=web", "start"]);
}
