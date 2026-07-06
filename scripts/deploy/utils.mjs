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
  while (currentDir !== path.dirname(currentDir)) {
    if (
      fs.existsSync(path.join(currentDir, "bun.lock")) &&
      fs.existsSync(path.join(currentDir, "turbo.json"))
    ) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  throw new Error("Monorepo root not found (missing bun.lock and turbo.json)");
}

/**
 * Executes a shell command synchronously with inherited stdio.
 * If the command fails, the script exits the process with the corresponding status code.
 * @param {string} cmd The command binary/executable.
 * @param {string[]} args Array of arguments.
 * @param {object} options Spawn options.
 * @returns {object} The command spawn result.
 */
export function runCommand(cmd, args, options = {}) {
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  
  const res = Bun.spawnSync([cmd, ...args], {
    stdio: ["inherit", "inherit", "inherit"],
    ...options,
  });

  if (res.exitCode !== 0) {
    console.error(`\n[Deploy] Error: Command failed with exit code ${res.exitCode}`);
    process.exit(res.exitCode ?? 1);
  }

  return res;
}

/**
 * Detects the pinned Turborepo version from the root package.json.
 * @param {string} rootDir The monorepo root directory.
 * @returns {Promise<string|null>} The turbo version string, or null if not found.
 */
export async function getTurboVersion(rootDir) {
  try {
    const pkgJsonPath = path.join(rootDir, "package.json");
    const file = Bun.file(pkgJsonPath);
    const pkgJson = await file.json();
    const turboVer = pkgJson.devDependencies?.turbo || pkgJson.dependencies?.turbo;
    
    if (!turboVer) {
      return null;
    }

    // Clean prefix tags like ^ or ~
    return turboVer.replace(/^[\^~]/, "");
  } catch (err) {
    console.warn(`[Deploy] Warning: Could not parse turbo version from package.json: ${err.message}`);
    return null;
  }
}
