import { readFileSync, writeFileSync } from "node:fs";

import type { CatalogRepairReport } from "../catalog/types";

import { formatDependabotAuditComment, validateDependabotFiles } from "../catalog/dependabot";
import {
  runAuxiliaryUpdates,
  runHelperChecks,
  validateHelperPolicy,
  type HelperCheckResult,
} from "./auxiliary";
import { runCatalogAlignment } from "./catalog-alignment";

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
  if (args[0] === "validate-files") {
    const files = readFileSync(args[1]!, "utf8").split(/\r?\n/).filter(Boolean);
    const result = validateDependabotFiles(files);
    if (!result.allowed) {
      console.error(`Unexpected Dependabot files: ${result.unexpected.join(", ")}`);
      return 1;
    }
    return 0;
  }

  if (args[0] === "render") {
    // SAFETY: The workflow writes this JSON from the typed catalog repair report.
    const report = JSON.parse(readFileSync(args[1]!, "utf8")) as CatalogRepairReport;
    writeFileSync(
      args[2]!,
      `${formatDependabotAuditComment(report, {
        // SAFETY: The workflow provides one of the three values declared by this union.
        validation:
          (process.env.DEPENDABOT_VALIDATION as "passed" | "failed" | "not-run" | undefined) ??
          "not-run",
        commitSha: process.env.DEPENDABOT_COMMIT_SHA,
        rejectionReason: process.env.DEPENDABOT_REJECTION_REASON,
      })}\n`,
    );
    return 0;
  }

  if (args[0] === "align") {
    const report = runCatalogAlignment({
      rootDir,
      authorizedDependencies: ["*"],
      dryRun: args.includes("--dry-run"),
      validateLockfile: args.includes("--validate-lockfile"),
    }).report;
    console.log(JSON.stringify(report));
    return report.status === "rejected" || report.status === "invalid" ? 1 : 0;
  }

  if (args[0] !== "validate" && args[0] !== "check" && args[0] !== "update") {
    console.error("Usage: bun infra/dependabot-helper/cli.ts <validate|check|update|align>");
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
