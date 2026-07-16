import { existsSync, mkdirSync, rmSync } from "fs";
import { resolve } from "path";
import { spawnSync } from "child_process";
import { checkAll } from "./check";
import { applyUpdate, runVerification } from "./apply";
import { config } from "./pkg-update.config";
import { buildChangelogSection } from "./utils/changelog";
import { categorizeBump, type UpdateCandidate } from "./utils/ui";
import { retry, type RetryOptions } from "./utils/retry";

const __ciMain = import.meta.path.replace(/\\/g, "/") === process.argv[1]?.replace(/\\/g, "/");

export interface CiOptions {
  dryRun?: boolean;
  gitHubRunId?: string;
  gitHubSha?: string;
  patToken?: string;
  retry?: RetryOptions;
}

export interface CiSummary {
  groupName: string;
  branch: string;
  prNumber: number | null;
  skipped: boolean;
  error?: string;
}

interface GroupBatch {
  groupName: string;
  candidates: UpdateCandidate[];
}

function exec(
  cmd: string,
  args: string[],
  opts?: { cwd?: string },
): { stdout: string; stderr: string; status: number | null } {
  // nosemgrep
  const result = spawnSync(cmd, args, {
    encoding: "utf-8",
    cwd: opts?.cwd,
  });
  return {
    stdout: result.stdout?.trim() ?? "",
    stderr: result.stderr?.trim() ?? "",
    status: result.status,
  };
}

export function getGroupOrder(): string[] {
  const names = Object.keys(config.groups).filter((g) => g !== "expo");
  names.sort();
  return ["bun", "expo", ...names, "ungrouped"];
}

export function groupCandidates(candidates: UpdateCandidate[]): GroupBatch[] {
  const groups = new Map<string, UpdateCandidate[]>();

  for (const c of candidates) {
    const groupName = c.group ?? "ungrouped";
    const list = groups.get(groupName) ?? [];
    list.push(c);
    groups.set(groupName, list);
  }

  const ordered: GroupBatch[] = [];
  for (const name of getGroupOrder()) {
    const list = groups.get(name);
    if (list) {
      ordered.push({ groupName: name, candidates: list });
    }
  }

  return ordered;
}

export function highestBump(candidates: UpdateCandidate[]): "major" | "minor" | "patch" | null {
  let result: "major" | "minor" | "patch" | null = null;
  for (const c of candidates) {
    const bump = categorizeBump(c.currentVersion, c.latestVersion);
    if (bump === "major") return "major";
    if (bump === "minor") result = "minor";
    else if (bump === "patch" && result === null) result = "patch";
  }
  return result;
}

export function branchName(group: string): string {
  return `deps/${group}`;
}

export function worktreeDir(rootDir: string, group: string): string {
  return resolve(rootDir, ".worktrees", `deps-${group}`); // nosemgrep
}

async function remoteBranchExists(branch: string): Promise<boolean> {
  const result = exec("git", ["ls-remote", "--heads", "origin", branch]);
  return result.stdout.length > 0;
}

async function isPrMerged(branch: string): Promise<boolean> {
  const result = exec("gh", [
    "pr",
    "list",
    "--head",
    branch,
    "--state",
    "merged",
    "--json",
    "number",
    "-q",
    ".[0].number",
  ]);
  return result.stdout.length > 0;
}

async function ensureBranchCleanup(
  branch: string,
  dryRun: boolean,
): Promise<"new" | "existing" | "recreate"> {
  const exists = await remoteBranchExists(branch);
  if (!exists) return "new";

  const merged = await isPrMerged(branch);
  if (merged) {
    if (!dryRun) {
      exec("git", ["push", "origin", "--delete", branch]);
    }
    return "recreate";
  }

  return "existing";
}

function lockfileUpdated(cwd: string): boolean {
  const result = exec("git", ["diff", "--name-only"], { cwd });
  const files = result.stdout
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);
  return files.includes("bun.lock");
}

export async function buildPrBody(
  candidates: UpdateCandidate[],
  options: CiOptions,
): Promise<string> {
  const sections: string[] = [];

  const results = await Promise.all(
    candidates.map((c) =>
      buildChangelogSection(
        c.packageName,
        c.currentVersion.replace(/^[\^~>=<]+\s*/, ""),
        c.latestVersion.replace(/^[\^~>=<]+\s*/, ""),
        options.patToken,
      ),
    ),
  );
  sections.push(...results);

  sections.push("");
  sections.push("---");
  sections.push(
    `_Generated at ${new Date().toISOString()} · Workflow #${options.gitHubRunId ?? "local"} · Commit ${options.gitHubSha?.slice(0, 7) ?? "unknown"}_`,
  );

  return sections.join("\n\n");
}

async function createOrUpdatePr(
  group: string,
  branch: string,
  body: string,
  bump: "major" | "minor" | "patch" | null,
  dryRun: boolean,
): Promise<number | null> {
  const title = `chore(deps): update ${group}`;
  const labels = ["deps", bump ?? "patch"] as string[];
  const autoMerge = bump === "minor" || bump === "patch";

  if (dryRun) {
    return 0;
  }

  const existingPr = exec("gh", [
    "pr",
    "list",
    "--head",
    branch,
    "--state",
    "open",
    "--json",
    "number",
    "-q",
    ".[0].number",
  ]);

  let prNumber: number | null = null;

  if (existingPr.stdout) {
    const updateResult = exec("gh", [
      "pr",
      "edit",
      existingPr.stdout,
      "--title",
      title,
      "--body",
      body,
      "--add-label",
      labels.join(","),
    ]);
    if (updateResult.status === 0) {
      prNumber = Number(existingPr.stdout);
    }
  } else {
    const createResult = exec("gh", [
      "pr",
      "create",
      "--title",
      title,
      "--body",
      body,
      "--label",
      labels.join(","),
      "--head",
      branch,
    ]);
    if (createResult.status === 0 && createResult.stdout) {
      const match = createResult.stdout.match(/#(\d+)/);
      prNumber = match ? Number(match[1]) : null;
    }
  }

  if (prNumber && autoMerge) {
    exec("gh", ["pr", "merge", String(prNumber), "--auto", "--squash"]);
  }

  return prNumber;
}

function applyUpdatesToWorktree(candidates: UpdateCandidate[], wtDir: string): Promise<boolean> {
  let chain = Promise.resolve(true) as Promise<boolean>;
  candidates.forEach((c) => {
    chain = chain.then((ok) => (ok ? applyUpdate(c, wtDir, config) : false));
  });
  return chain;
}

async function processBatch(
  batch: GroupBatch,
  rootDir: string,
  options: CiOptions,
  retryOpts: RetryOptions,
): Promise<CiSummary> {
  const branch = branchName(batch.groupName);
  const wtDir = worktreeDir(rootDir, batch.groupName);

  try {
    const branchStatus = await ensureBranchCleanup(branch, options.dryRun ?? false);

    if (branchStatus === "existing") {
      const fetchResult = exec("git", ["fetch", "origin", branch]);
      if (fetchResult.status === 0) {
        const diffResult = exec("git", ["diff", "--quiet", `origin/${branch}`, "--", ":!bun.lock"]);
        if (diffResult.status === 0) {
          return {
            groupName: batch.groupName,
            branch,
            prNumber: null,
            skipped: true,
          };
        }
      }
    }

    if (options.dryRun) {
      return {
        groupName: batch.groupName,
        branch,
        prNumber: null,
        skipped: false,
      };
    }

    if (existsSync(wtDir)) {
      rmSync(wtDir, { recursive: true, force: true });
    }
    mkdirSync(wtDir, { recursive: true });
    const addResult = exec("git", ["worktree", "add", wtDir, "origin/main"]);
    if (addResult.status !== 0) {
      throw new Error(`worktree add failed: ${addResult.stderr}`);
    }
    console.log(`[${batch.groupName}] Worktree created at ${wtDir}`);

    const baseInstallResult = exec("bun", ["install", "--frozen-lockfile"], { cwd: wtDir });
    if (baseInstallResult.status !== 0) {
      throw new Error(
        `worktree base install failed: ${baseInstallResult.stderr || baseInstallResult.stdout}`,
      );
    }
    console.log(`[${batch.groupName}] Baseline dependencies installed`);

    console.log(`[${batch.groupName}] Applying updates for ${batch.candidates.length} packages...`);
    const applyOk = await applyUpdatesToWorktree(batch.candidates, wtDir);
    if (!applyOk) {
      throw new Error("applyUpdate failed for one or more packages");
    }
    console.log(`[${batch.groupName}] Package updates applied`);

    console.log(`[${batch.groupName}] Installing updated dependencies...`);
    const verifyResult = exec("bun", ["install"], { cwd: wtDir });
    if (verifyResult.status !== 0) {
      throw new Error(`bun install failed: ${verifyResult.stderr || verifyResult.stdout}`);
    }
    console.log(`[${batch.groupName}] Updated dependencies installed`);

    if (!lockfileUpdated(wtDir)) {
      throw new Error("Lockfile verification failed: bun.lock was not updated by bun install");
    }
    console.log(`[${batch.groupName}] Lockfile updated`);

    exec("git", ["config", "user.email", "github-actions[bot]@users.noreply.github.com"], {
      cwd: wtDir,
    });
    exec("git", ["config", "user.name", "github-actions[bot]"], { cwd: wtDir });

    const baseMsg =
      batch.groupName === "ungrouped"
        ? "chore(deps): update ungrouped packages"
        : `chore(deps): update ${batch.groupName}`;
    exec("git", ["add", "-A"], { cwd: wtDir });
    console.log(`[${batch.groupName}] Committing changes...`);
    const commitResult = exec("git", ["commit", "-m", baseMsg], {
      cwd: wtDir,
    });
    if (commitResult.status !== 0) {
      throw new Error(`git commit failed: ${commitResult.stderr}`);
    }
    console.log(`[${batch.groupName}] Changes committed`);

    console.log(`[${batch.groupName}] Pushing to origin/${branch}...`);
    const pushResult = exec(
      "git",
      [
        "push",
        ...(branchStatus === "existing" ? ["--force"] : []),
        "origin",
        `HEAD:refs/heads/${branch}`,
      ],
      { cwd: wtDir },
    );
    if (pushResult.status !== 0) {
      throw new Error(`git push failed: ${pushResult.stderr}`);
    }
    console.log(`[${batch.groupName}] Push succeeded`);

    const bump = highestBump(batch.candidates);
    const body = await retry(() => buildPrBody(batch.candidates, options), retryOpts);
    const prNumber = await createOrUpdatePr(batch.groupName, branch, body, bump, false);

    return {
      groupName: batch.groupName,
      branch,
      prNumber,
      skipped: false,
    };
  } finally {
    if (existsSync(wtDir)) {
      exec("git", ["worktree", "remove", "--force", wtDir], {
        cwd: rootDir,
      });
      rmSync(wtDir, { recursive: true, force: true });
    }
  }
}

function scheduleBatches(
  batches: GroupBatch[],
  rootDir: string,
  options: CiOptions,
  retryOpts: RetryOptions,
  summaries: CiSummary[],
): Promise<void> {
  let chain = Promise.resolve() as Promise<void>;
  batches.forEach((batch) => {
    chain = chain.then(() =>
      processBatch(batch, rootDir, options, retryOpts).then((s) => {
        summaries.push(s);
      }),
    );
  });
  return chain;
}

export async function runCi(rootDir: string, options: CiOptions = {}): Promise<CiSummary[]> {
  const summaries: CiSummary[] = [];
  const retryOpts = options.retry ?? { retries: 3, minTimeout: 1000 };

  const candidates = await retry(() => checkAll(rootDir, config), retryOpts);
  const batches = groupCandidates(candidates);

  await scheduleBatches(batches, rootDir, options, retryOpts, summaries);

  return summaries;
}

if (__ciMain) {
  const { findMonorepoRoot } = await import("../../scripts/utils/paths.mjs");
  const rootDir = findMonorepoRoot();
  const options: CiOptions = {};
  if (process.argv.includes("--dry-run")) options.dryRun = true;
  if (process.env.GITHUB_RUN_ID) options.gitHubRunId = process.env.GITHUB_RUN_ID;
  if (process.env.GITHUB_SHA) options.gitHubSha = process.env.GITHUB_SHA;
  if (process.env.PAT_TOKEN) options.patToken = process.env.PAT_TOKEN;

  const summaries = await runCi(rootDir, options);

  for (const s of summaries) {
    if (s.skipped) {
      console.log(`${s.groupName}: skipped`);
    } else if (s.error) {
      console.log(`${s.groupName}: error (${s.error})`);
    } else {
      console.log(`${s.groupName}: success${s.prNumber ? ` (PR #${s.prNumber})` : ""}`);
    }
  }
}
