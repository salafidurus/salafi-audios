import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  runAuxiliaryUpdates,
  runHelperChecks,
  validateHelperPolicy,
  type HelperCheckResult,
} from "./auxiliary";

/** Reads native Dependabot ignore entries without making YAML a runtime dependency. */
export function extractDependabotIgnoredPatterns(source: string): string[] {
  return Array.from(
    source.matchAll(/^\s*-\s*dependency-name:\s*["']?([^"'\s]+)["']?\s*$/gm),
    (match) => match[1]!,
  );
}

/** Validates the typed helper policy against the repository's native Dependabot file. */
export function validateRepositoryPolicy(rootDir: string): string[] {
  return validateHelperPolicy(rootDir);
}

/** Runs helper-owned invariant checks without creating update proposals. */
export function checkRepository(rootDir: string): HelperCheckResult {
  const policyErrors = validateRepositoryPolicy(rootDir);
  if (policyErrors.length > 0) return { accepted: false, errors: policyErrors };
  return runHelperChecks(rootDir);
}

/** Executes one Helper CLI command and returns its process exit status. */
export async function main(args: string[], rootDir: string): Promise<number> {
  if (args[0] !== "validate" && args[0] !== "check" && args[0] !== "update") {
    console.error("Usage: bun infra/dependabot-helper/cli.ts <validate|check|update>");
    return 1;
  }

  if (args[0] === "update") {
    await runAuxiliaryUpdates(rootDir, {
      dryRun: args.includes("--dry-run") || args.includes("--report-only"),
      reportOnly: args.includes("--report-only"),
    });
    return 0;
  }

  const errors =
    args[0] === "check" ? checkRepository(rootDir).errors : validateRepositoryPolicy(rootDir);
  if (errors.length > 0) {
    console.error("Invalid Dependabot Helper policy:");
    for (const error of errors) console.error(`- ${error}`);
    return 1;
  }

  console.log("Dependabot Helper policy is valid.");
  return 0;
}

if (import.meta.main) process.exitCode = await main(process.argv.slice(2), process.cwd());
