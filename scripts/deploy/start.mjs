#!/usr/bin/env bun
import { findMonorepoRoot } from "./utils/paths.mjs";
import { log, error } from "./utils/logging.mjs";

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
    await Bun.$.cwd(rootDir)`bun run --filter=api start:prod`;
  } else if (target === "web") {
    // Start Next.js web application in production mode
    await Bun.$.cwd(rootDir)`bun run --filter=web start`;
  }
} catch (err) {
  error(`Application execution failed: ${err.message}`);
  process.exit(1);
}
