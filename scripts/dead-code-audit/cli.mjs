#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFile, readdir, unlink } from "node:fs/promises";
import { relative, resolve } from "node:path";

import {
  assertRemovalScope,
  blocksPreparation,
  changedFilesFromDiff,
  findingKey,
  scopeIntroducedFindings,
  withFindingKey,
} from "./policy.mjs";
import { classifyTestFile, isTestFile, normalizeTestSource } from "./test-classification.mjs";

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

function parseArgs(args) {
  const values = { format: "markdown", mode: "audit" };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (["--root", "--format", "--baseline", "--base", "--ticket", "--allowlist"].includes(arg)) {
      values[arg.slice(2)] = args[index + 1];
      index += 1;
    } else if (arg === "--mode") {
      values.mode = args[index + 1];
      index += 1;
    } else if (arg === "--check-introduced") {
      values.checkIntroduced = true;
    }
  }
  return values;
}

function usage() {
  return "Usage: dead-code-audit [--mode audit|remove] [--root <path>] [--format json|markdown] [--baseline <file>] [--base <ref>] [--check-introduced] [--ticket <number> --allowlist <file>]";
}

function runKnip(auditRoot) {
  const knipPath = resolve(import.meta.dirname, "..", "..", "node_modules/knip/dist/cli.js");
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
  if (result.error) throw result.error;
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error(result.stderr || "Knip did not return valid JSON");
  }
}

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

async function collectFindings(auditRoot) {
  const knipReport = runKnip(auditRoot);
  const findings = (knipReport.issues ?? []).flatMap((entry) => {
    const file = relative(auditRoot, resolve(auditRoot, entry.file));
    return Object.entries(entry).flatMap(([type, items]) => {
      if (type === "file" || !Array.isArray(items)) return [];
      return items.map((item) =>
        withFindingKey({
          category: deadCodeTypes.has(type) ? "likely-dead" : "unknown/dynamic",
          confidence: type === "files" ? "medium" : "low",
          evidence: `Knip reported a ${type} issue from the configured workspace graph.`,
          file,
          name: item.name ?? item.symbol ?? item,
          type: typeNames[type] ?? type,
        }),
      );
    });
  });

  const testSources = [];
  for (const path of await collectTestFiles(auditRoot)) {
    testSources.push({ file: relative(auditRoot, path), source: await readFile(path, "utf8") });
  }
  const sourceGroups = Map.groupBy(testSources, ({ source }) => normalizeTestSource(source));
  const testFindings = testSources.map(({ file, source }) => {
    const matches = sourceGroups.get(normalizeTestSource(source));
    const finding =
      matches?.length > 1
        ? {
            category: "duplicate",
            confidence: "medium",
            evidence: `The normalized test source exactly matches ${matches.length - 1} other test file(s).`,
            file,
            recommendation: "Confirm shared intent before consolidating tests.",
          }
        : classifyTestFile({ file, source });
    return withFindingKey(finding, "test");
  });
  return { findings, testFindings };
}

async function readJson(path, fallback) {
  if (!path) return fallback;
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function loadChangedFiles(auditRoot, base) {
  if (!base) return new Set();
  const result = spawnSync("git", ["diff", "--name-status", base], {
    cwd: auditRoot,
    encoding: "utf8",
  });
  if (result.status !== 0)
    throw new Error(result.stderr || `Unable to inspect diff against ${base}`);
  return changedFilesFromDiff(result.stdout);
}

async function readAllowlist(path) {
  const content = await readFile(path, "utf8");
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : (parsed.findings ?? []);
  } catch {
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
}

function baselineKeys(baseline) {
  return new Set([
    ...(baseline.findingKeys ?? []),
    ...(baseline.testFindingKeys ?? []),
    ...(baseline.findings ?? []).map((finding) => finding.key ?? findingKey(finding)),
    ...(baseline.testFindings ?? []).map(
      (finding) => finding.key ?? findingKey({ ...finding, kind: "test" }),
    ),
  ]);
}

function makeReport({
  auditRoot,
  mode,
  findings,
  testFindings,
  baseline,
  introduced,
  blocking,
  changedFiles,
}) {
  return {
    baseline: {
      findingCount: baseline.findings?.length ?? baseline.findingKeys?.length ?? 0,
      sourceCommit: baseline.sourceCommit ?? null,
      testFindingCount: baseline.testFindings?.length ?? baseline.testFindingKeys?.length ?? 0,
    },
    changedFiles: [...changedFiles].sort(),
    findings,
    introduced,
    mode: mode === "audit" ? "report-only" : mode,
    root: auditRoot,
    testFindings,
    blocking,
    tool: "knip",
  };
}

function findAllowlistedFindings(report, allowlist) {
  const allowed = new Set(allowlist);
  return [...report.findings, ...report.testFindings]
    .filter((finding) => allowed.has(finding.key) || allowed.has(finding.file))
    .map((finding) => {
      const explicitlyApprovedPlaceholder =
        (finding.kind === "test" || finding.type === "file") &&
        ["placeholder", "permanently-skipped", "likely-dead"].includes(finding.category) &&
        allowed.has(finding.file) &&
        isTestFile(finding.file);
      return explicitlyApprovedPlaceholder
        ? { ...finding, category: "confirmed-dead", confidence: "high" }
        : finding;
    });
}

async function removeFindings(auditRoot, candidates) {
  const files = [...new Set(candidates.map(({ file }) => file))].sort();
  for (const file of files) await unlink(resolve(auditRoot, file));
  return { removedFiles: files };
}

function printReport(report, format) {
  if (format === "json") {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }
  process.stdout.write(`# Dead-code audit\n\nMode: ${report.mode}\n\n`);
  process.stdout.write(
    `Baseline findings: ${report.baseline.findingCount}; introduced findings: ${report.introduced.length}\n\n`,
  );
  if (report.blocking.length > 0) process.stdout.write("## Blocking findings\n\n");
  for (const finding of report.blocking)
    process.stdout.write(`- ${finding.category}: \`${finding.file}\` (${finding.key})\n`);
  process.stdout.write("## Test inventory\n\n");
  process.stdout.write(`Test files reviewed: ${report.testFindings.length}\n\n`);
  for (const category of new Set(report.testFindings.map(({ category }) => category))) {
    process.stdout.write(
      `- ${category}: ${report.testFindings.filter((finding) => finding.category === category).length}\n`,
    );
  }
}

export async function runAudit(options = {}) {
  const auditRoot = resolve(options.root ?? process.cwd());
  const mode = options.mode ?? "audit";
  if (!["audit", "remove"].includes(mode)) throw new Error(usage());
  const { findings, testFindings } = await collectFindings(auditRoot);
  const baseline = await readJson(options.baseline, {});
  const changedFiles = loadChangedFiles(auditRoot, options.base);
  const allFindings = [...findings, ...testFindings];
  const introduced = options.base
    ? scopeIntroducedFindings(allFindings, { changedFiles, baselineKeys: baselineKeys(baseline) })
    : [];
  const blocking = options.checkIntroduced ? blocksPreparation(introduced) : [];
  const report = makeReport({
    auditRoot,
    mode,
    findings,
    testFindings,
    baseline,
    introduced,
    blocking,
    changedFiles,
  });

  if (mode === "remove") {
    const allowlist = await readAllowlist(options.allowlist);
    const candidates = findAllowlistedFindings(report, allowlist);
    assertRemovalScope({ ticket: options.ticket, allowlist, findings: candidates });
    const before = candidates.map((finding) => ({ ...finding }));
    const removal = await removeFindings(auditRoot, candidates);
    report.removal = { ...removal, before, after: await collectFindings(auditRoot) };
  }
  return report;
}

if (import.meta.main) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (!["json", "markdown"].includes(options.format)) throw new Error(usage());
    const report = await runAudit(options);
    printReport(report, options.format);
    if (report.blocking.length > 0) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
