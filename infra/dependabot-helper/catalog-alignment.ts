import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type { CatalogConfig, CatalogRepairReport } from "./catalog/types";

import { runCatalogFix } from "./catalog/scanner/fix";

/**
 * Describes the already-authorized dependency update that alignment may repair.
 * Alignment never resolves a newer version; it only normalizes the files
 * produced by the owning updater.
 */
export interface CatalogAlignmentOptions {
  rootDir: string;
  /** Dependency names authorized by the owning update; `*` is reserved for trusted Dependabot input. */
  authorizedDependencies: string[];
  dryRun?: boolean;
  validateLockfile?: boolean;
  catalogConfig?: CatalogConfig;
  install?: (rootDir: string) => { status: number | null; stderr?: string; stdout?: string };
}

export interface CatalogAlignmentResult {
  /** The complete mutation and lockfile outcome for the alignment transaction. */
  report: CatalogRepairReport;
}

const emptyCatalogPolicy: CatalogConfig = {
  groups: [],
  policies: [],
  compatibilityGroups: [],
};

function defaultInstall(rootDir: string) {
  const result = spawnSync("bun", ["install", "--ignore-scripts"], {
    cwd: rootDir,
    encoding: "utf8",
  });
  return { status: result.status, stderr: result.stderr, stdout: result.stdout };
}

function snapshotFiles(rootDir: string): Map<string, string | null> {
  const paths = [
    "package.json",
    "bun.lock",
    ...readWorkspacePackagePaths(rootDir),
  ];
  return new Map(
    [...new Set(paths)].map((filePath) => {
      const absolutePath = resolve(rootDir, filePath);
      return [filePath, existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : null];
    }),
  );
}

function readWorkspacePackagePaths(rootDir: string): string[] {
  const result = spawnSync(
    "find",
    [rootDir, "-path", "*/node_modules", "-prune", "-o", "-name", "package.json", "-print"],
    {
      encoding: "utf8",
    },
  );
  return (result.stdout ?? "")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((filePath) => filePath.slice(rootDir.length + 1));
}

function restoreFiles(rootDir: string, snapshot: Map<string, string | null>) {
  for (const [filePath, content] of snapshot) {
    const absolutePath = resolve(rootDir, filePath);
    if (content === null) {
      if (existsSync(absolutePath)) unlinkSync(absolutePath);
    } else {
      writeFileSync(absolutePath, content);
    }
  }
}

function rejectedReport(reason: string): CatalogAlignmentResult {
  return {
    report: {
      status: "rejected",
      mutations: [],
      updatedFiles: [],
      issues: [],
      reason,
      lockfile: "unchanged",
    },
  };
}

/**
 * Applies only catalog normalization authorized by an owning update.
 *
 * The repair is planned before it is written so an unauthorized mutation or
 * ambiguous policy result leaves every input file untouched. Lockfile
 * validation is transactional: failed installation restores the snapshot.
 */
export function runCatalogAlignment(options: CatalogAlignmentOptions): CatalogAlignmentResult {
  const config = options.catalogConfig ?? emptyCatalogPolicy;
  const planned = runCatalogFix(options.rootDir, {
    dryRun: true,
    config,
  }).report;
  if (planned.status === "rejected" || planned.status === "invalid") {
    return { report: planned };
  }

  const authorized = new Set(options.authorizedDependencies);
  const unauthorized = planned.mutations.find(
    (mutation) =>
      mutation.workspace !== "root" && !authorized.has("*") && !authorized.has(mutation.dependency),
  );
  if (unauthorized) {
    return rejectedReport(
      `Mutation for '${unauthorized.dependency}' is outside the authorized dependency scope`,
    );
  }
  if (options.dryRun || planned.status === "no-op") return { report: planned };

  const snapshot = snapshotFiles(options.rootDir);
  const applied = runCatalogFix(options.rootDir, { config }).report;
  if (applied.status === "rejected" || applied.status === "invalid") return { report: applied };
  if (!options.validateLockfile) return { report: applied };

  const install = (options.install ?? defaultInstall)(options.rootDir);
  if (install.status !== 0) {
    restoreFiles(options.rootDir, snapshot);
    return rejectedReport(
      `Lockfile validation failed: ${install.stderr || install.stdout || "bun install failed"}`,
    );
  }
  return {
    report: { ...applied, lockfile: "validated" },
  };
}
