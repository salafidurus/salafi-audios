import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { dependabotHelperPolicy, validatePolicy } from "./policy";

/** Reads native Dependabot ignore entries without making YAML a runtime dependency. */
export function extractDependabotIgnoredPatterns(source: string): string[] {
  return Array.from(
    source.matchAll(/^\s*-\s*dependency-name:\s*["']?([^"'\s]+)["']?\s*$/gm),
    (match) => match[1]!,
  );
}

/** Validates the typed helper policy against the repository's native Dependabot file. */
export function validateRepositoryPolicy(rootDir: string): string[] {
  const dependabotPath = resolve(rootDir, ".github/dependabot.yml");
  const source = readFileSync(dependabotPath, "utf8");
  return validatePolicy(dependabotHelperPolicy, extractDependabotIgnoredPatterns(source));
}

function main(args: string[], rootDir: string): number {
  if (args[0] !== "validate") {
    console.error("Usage: bun infra/dependabot-helper/cli.ts validate");
    return 1;
  }

  const errors = validateRepositoryPolicy(rootDir);
  if (errors.length > 0) {
    console.error("Invalid Dependabot Helper policy:");
    for (const error of errors) console.error(`- ${error}`);
    return 1;
  }

  console.log("Dependabot Helper policy is valid.");
  return 0;
}

if (import.meta.main) process.exitCode = main(process.argv.slice(2), process.cwd());
