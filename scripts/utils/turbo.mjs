import path from "node:path";
import { warn } from "./logging.mjs";

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
    warn(`Could not parse turbo version from package.json: ${err.message}`);
    return null;
  }
}

/**
 * Validates the existence of Bun utilities in the path.
 */
export function validateEnvironment() {
  if (!Bun.which("bun")) {
    throw new Error("'bun' CLI is not found in the environment PATH");
  }
  if (!Bun.which("bunx")) {
    throw new Error("'bunx' CLI is not found in the environment PATH");
  }
}
