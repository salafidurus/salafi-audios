#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { relative, resolve } from "node:path";

import { classifyTestFile, isTestFile, normalizeTestSource } from "./test-classification.mjs";

const args = process.argv.slice(2);
const rootIndex = args.indexOf("--root");
const formatIndex = args.indexOf("--format");
const auditRoot = resolve(rootIndex === -1 ? process.cwd() : args[rootIndex + 1]);
const format = formatIndex === -1 ? "markdown" : args[formatIndex + 1];
const knipPath = resolve(import.meta.dirname, "..", "..", "node_modules/knip/dist/cli.js");

if (!auditRoot || !["json", "markdown"].includes(format)) {
  console.error("Usage: dead-code-audit [--root <path>] [--format json|markdown]");
  process.exit(2);
}

const result = spawnSync(
  process.execPath,
  [
    knipPath,
    "--include",
    "files,dependencies,exports,types,unresolved,duplicates,cycles",
    "--reporter",
    "json",
    "--no-progress",
    "--no-exit-code",
  ],
  { cwd: auditRoot, encoding: "utf8" },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

let knipReport;
try {
  knipReport = JSON.parse(result.stdout);
} catch {
  console.error(result.stderr || "Knip did not return valid JSON");
  process.exit(1);
}

const deadCodeTypes = new Set(["files", "exports", "types", "duplicates"]);
const typeNames = {
  binaries: "binary",
  dependencies: "dependency",
  devDependencies: "devDependency",
  duplicates: "duplicate",
  enumMembers: "enumMember",
  exports: "export",
  files: "file",
  namespaceMembers: "namespaceMember",
  nsExports: "namespaceExport",
  nsTypes: "namespaceType",
  types: "type",
  unresolved: "unresolved",
};
const findings = (knipReport.issues ?? []).flatMap((entry) => {
  const file = relative(auditRoot, resolve(auditRoot, entry.file));
  return Object.entries(entry).flatMap(([type, items]) => {
    if (type === "file" || !Array.isArray(items)) return [];
    return items.map((item) => ({
      category: deadCodeTypes.has(type) ? "likely-dead" : "unknown/dynamic",
      confidence: type === "files" ? "medium" : "low",
      evidence: `Knip reported a ${type} issue from the configured workspace graph.`,
      file,
      name: item.name ?? item.symbol ?? item,
      type: typeNames[type] ?? type,
    }));
  });
});

async function collectTestFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", ".next", "coverage", "dist", "generated", "node_modules"].includes(entry.name))
      continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectTestFiles(path)));
    else if (entry.isFile() && isTestFile(entry.name)) files.push(path);
  }
  return files;
}

const testSources = [];
for (const path of await collectTestFiles(auditRoot)) {
  const file = relative(auditRoot, path);
  const source = await readFile(path, "utf8");
  testSources.push({ file, source });
}
const sourceGroups = Map.groupBy(testSources, ({ source }) => normalizeTestSource(source));
const testFindings = testSources.map(({ file, source }) => {
  const matches = sourceGroups.get(normalizeTestSource(source));
  if (matches?.length > 1) {
    return {
      category: "duplicate",
      confidence: "medium",
      evidence: `The normalized test source exactly matches ${matches.length - 1} other test file(s).`,
      file,
      recommendation: "Confirm shared intent before consolidating tests.",
    };
  }
  return classifyTestFile({ file, source });
});

const report = {
  findings,
  mode: "report-only",
  root: auditRoot,
  testFindings,
  tool: "knip",
};

if (format === "json") {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  process.stdout.write(`# Dead-code audit\n\n`);
  process.stdout.write(`Mode: ${report.mode}\n\n`);
  if (findings.length === 0) {
    process.stdout.write("No likely-dead files reported.\n");
  } else {
    for (const finding of findings) {
      process.stdout.write(`- ${finding.category}: \`${finding.file}\` (${finding.confidence})\n`);
    }
  }
  process.stdout.write(`\n## Test inventory\n\n`);
  process.stdout.write(`Test files reviewed: ${testFindings.length}\n\n`);
  for (const category of new Set(testFindings.map(({ category }) => category))) {
    process.stdout.write(
      `- ${category}: ${testFindings.filter((finding) => finding.category === category).length}\n`,
    );
  }
}
