#!/usr/bin/env bun
import { findMonorepoRoot } from "../utils/paths.mjs";
import { log, error, setPrefix } from "../utils/logging.mjs";

setPrefix("[Deploy:Start]");

const target = process.argv[2];

if (target !== "web" && target !== "api") {
  error(`Invalid target "${target}". Supported targets are "web" and "api".`);
  process.exit(1);
}

try {
  log(`Starting application for target: "${target}"`);

  const rootDir = findMonorepoRoot();

  if (target === "api") {
    // Start NestJS backend in production mode (compiled JS entry point)
    log("Starting api production server...");
    await Bun.$.cwd(rootDir)`bun run --filter=api start:prod`;
    log("Starting api production server... Done");
  } else if (target === "web") {
    // Start Next.js web application in production mode
    log("Starting web production server...");
    await Bun.$.cwd(rootDir)`bun run --filter=web start`;
    log("Starting web production server... Done");
  }
} catch (err) {
  error(`Application execution failed: ${err.message}`);
  process.exit(1);
}
