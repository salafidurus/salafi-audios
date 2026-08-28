import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const repositoryRoot = resolve(process.cwd());
const baselinePath = resolve(repositoryRoot, ".oxlint-docs-baseline.json");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if ([".next", "build", "coverage", "dist", "generated", "node_modules"].includes(entry.name))
        return [];
      return sourceFiles(path);
    }
    return /\.(?:ts|tsx)$/u.test(entry.name) ? [path] : [];
  });
}

/** Create the migration baseline for existing TSDoc findings without weakening changed-file enforcement. */
function main(): void {
  const files = new Set(
    ["apps", "packages"].flatMap((rootDirectory) =>
      sourceFiles(resolve(repositoryRoot, rootDirectory)).map((filename) =>
        relative(repositoryRoot, filename),
      ),
    ),
  );
  const entries = Object.fromEntries(
    [...files]
      .filter((filename) => existsSync(resolve(repositoryRoot, filename)))
      .sort()
      .map((filename) => {
        const source = readFileSync(resolve(repositoryRoot, filename));
        return [filename, createHash("sha256").update(source).digest("hex")];
      }),
  );
  writeFileSync(baselinePath, `${JSON.stringify({ version: 1, files: entries }, null, 2)}\n`);
  console.log(`Wrote ${Object.keys(entries).length} files to ${baselinePath}`);
}

main();
