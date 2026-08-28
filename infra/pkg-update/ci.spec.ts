import { describe, it, expect, mock, beforeAll, beforeEach, afterEach } from "bun:test";
import { join } from "node:path";

import type { UpdateCandidate } from "./utils/ui";

import {
  getGroupOrder,
  groupCandidates,
  highestBump,
  branchName,
  worktreeDir,
  sanitizeBranchName,
  buildPrBody,
  runCi,
  suppressHeldCandidates,
} from "./ci";
import { clearChangelogCache } from "./utils/changelog";

function makeCandidate(overrides: Partial<UpdateCandidate> = {}): UpdateCandidate {
  return {
    type: "catalog",
    packageName: "test-pkg",
    currentVersion: "^1.0.0",
    latestVersion: "1.1.0",
    ...overrides,
  };
}

beforeEach(() => {
  clearChangelogCache();
});

describe("getGroupOrder", () => {
  it("returns bun first, expo second, alphabetical catalog groups, ungrouped last", () => {
    const order = getGroupOrder();
    expect(order[0]).toBe("bun");
    expect(order[1]).toBe("expo");
    expect(order[order.length - 1]).toBe("ungrouped");

    // Verify alphabetical between expo and ungrouped
    const middle = order.slice(2, -1);
    for (let i = 1; i < middle.length; i++) {
      expect(middle[i]! >= middle[i - 1]!).toBe(true);
    }
  });
});

describe("groupCandidates", () => {
  it("groups by candidate group field", () => {
    const a = makeCandidate({ group: "turbo", packageName: "turbo" });
    const b = makeCandidate({ group: "typescript", packageName: "typescript" });
    const c = makeCandidate({ group: undefined, packageName: "something" });

    const batches = groupCandidates([a, b, c]);
    expect(batches).toHaveLength(3);

    const names = batches.map((b) => b.groupName);
    expect(names).toContain("turbo");
    expect(names).toContain("typescript");
    expect(names).toContain("ungrouped");
  });

  it("returns empty for no candidates", () => {
    expect(groupCandidates([])).toEqual([]);
  });

  it("places ungrouped candidates after the special pipelines", () => {
    const a = makeCandidate({ group: "ungrouped" });
    const b = makeCandidate({ group: "beta" });
    const c = makeCandidate({ group: "alpha" });
    const d = makeCandidate({ group: "bun" });

    const batches = groupCandidates([a, b, c, d]);
    const names = batches.map((b) => b.groupName);

    const bunIdx = names.indexOf("bun");
    const alphaIdx = names.indexOf("alpha");
    const betaIdx = names.indexOf("beta");
    const ungroupedIdx = names.indexOf("ungrouped");
    expect(bunIdx).toBe(0);
    expect(ungroupedIdx).toBe(1);
    expect(alphaIdx).toBe(3);
    expect(betaIdx).toBe(2);
  });

  it("includes dynamic groups (e.g. never packages) after known groups", () => {
    const a = makeCandidate({ group: "ungrouped" });
    const b = makeCandidate({ group: "zeta" });
    const c = makeCandidate({ group: "alpha" });

    const batches = groupCandidates([a, b, c]);
    const names = batches.map((b) => b.groupName);

    expect(names).toContain("zeta");
    const dynIdx = names.indexOf("zeta");
    const ungroupedIdx = names.indexOf("ungrouped");
    const alphaIdx = names.indexOf("alpha");
    expect(ungroupedIdx).toBeLessThan(dynIdx);
    expect(dynIdx).toBe(1);
    expect(alphaIdx).toBe(2);
  });

  it("preserves input order for dynamic groups", () => {
    const a = makeCandidate({ group: "beta" });
    const b = makeCandidate({ group: "alpha" });

    const batches = groupCandidates([a, b]);
    const names = batches.map((x) => x.groupName);

    expect(names.indexOf("beta")).toBeLessThan(names.indexOf("alpha"));
  });
});

describe("highestBump", () => {
  it("returns null for empty list", () => {
    expect(highestBump([])).toBeNull();
  });

  it("returns major when any candidate is major", () => {
    const c = [
      makeCandidate({ currentVersion: "^1.0.0", latestVersion: "2.0.0" }),
      makeCandidate({ currentVersion: "^1.0.0", latestVersion: "1.1.0" }),
    ];
    expect(highestBump(c)).toBe("major");
  });

  it("returns minor when highest is minor", () => {
    const c = [
      makeCandidate({ currentVersion: "^1.0.0", latestVersion: "1.1.0" }),
      makeCandidate({ currentVersion: "^2.0.0", latestVersion: "2.0.1" }),
    ];
    expect(highestBump(c)).toBe("minor");
  });

  it("returns patch for only patch bumps", () => {
    const c = [makeCandidate({ currentVersion: "^1.0.0", latestVersion: "1.0.1" })];
    expect(highestBump(c)).toBe("patch");
  });
});

describe("sanitizeBranchName", () => {
  it("replaces @ and / with - and strips leading dash", () => {
    expect(sanitizeBranchName("@babel/runtime")).toBe("babel-runtime");
    expect(sanitizeBranchName("@nestjs/core")).toBe("nestjs-core");
  });

  it("replaces / with -", () => {
    expect(sanitizeBranchName("a/b/c")).toBe("a-b-c");
  });

  it("leaves plain names unchanged", () => {
    expect(sanitizeBranchName("typescript")).toBe("typescript");
    expect(sanitizeBranchName("typescript")).toBe("typescript");
  });
});

describe("branchName", () => {
  it("formats branch name with deps/ prefix", () => {
    expect(branchName("typescript")).toBe("deps/typescript");
    expect(branchName("bun")).toBe("deps/bun");
    expect(branchName("ungrouped")).toBe("deps/ungrouped");
  });

  it("sanitizes special characters in group name", () => {
    expect(branchName("@babel/runtime")).toBe("deps/babel-runtime");
  });
});

describe("worktreeDir", () => {
  it("generates worktree path under .worktree", () => {
    const result = worktreeDir("/repo", "typescript");
    expect(result).toBe(join("/repo", ".worktree", "deps-typescript"));
  });

  it("sanitizes special characters in group name", () => {
    const result = worktreeDir("/repo", "@babel/runtime");
    expect(result).toContain("deps-babel-runtime");
  });
});

describe("buildPrBody", () => {
  it("returns formatted body with changelog sections and footer", async () => {
    const c = [
      makeCandidate({
        packageName: "mock-pkg",
        currentVersion: "^1.0.0",
        latestVersion: "1.1.0",
      }),
    ];

    const body = await buildPrBody(c, {
      gitHubRunId: "1234",
      gitHubSha: "abc123def456",
    });

    expect(body).toContain("mock-pkg");
    expect(body).toContain("Workflow #1234");
    expect(body).toContain("Commit abc123d");
  });

  it("handles empty candidates gracefully", async () => {
    const body = await buildPrBody([], {});
    expect(body).toBeTruthy();
    expect(body).toContain("_Generated at");
  });
});

describe("runCi", () => {
  let tmpDir: string;
  const { mkdtempSync, writeFileSync } = require("fs") as typeof import("fs");
  const { tmpdir } = require("os") as typeof import("os");

  // Mock child_process globally — ci.ts uses spawnSync
  beforeAll(() => {
    mock.module("child_process", () => ({
      spawnSync: () => ({ status: 0, stdout: "", stderr: "" }),
    }));
  });

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "pkg-update-ci-test-"));
    writeFileSync(
      join(tmpDir, "package.json"),
      JSON.stringify({
        name: "test-mono",
        workspaces: {
          packages: [],
          catalog: {},
        },
        devDependencies: {},
      }),
    );
  });

  afterEach(() => {
    const { rmSync } = require("fs") as typeof import("fs");
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns empty summaries when no candidates in dry-run", async () => {
    const summaries = await runCi(tmpDir, { dryRun: true });
    expect(summaries).toEqual([]);
  });

  it("dry-run does not write worktree directories", async () => {
    const summaries = await runCi(tmpDir, { dryRun: true });
    const { existsSync } = require("fs") as typeof import("fs");
    expect(summaries).toEqual([]);
    expect(existsSync(join(tmpDir, ".worktree"))).toBe(false);
  });

  it("report-only mode does not create update worktrees", async () => {
    const summaries = await runCi(tmpDir, { reportOnly: true });
    const { existsSync } = require("fs") as typeof import("fs");
    expect(summaries).toEqual([]);
    expect(existsSync(join(tmpDir, ".worktree"))).toBe(false);
  });
});

describe("suppressHeldCandidates", () => {
  type ExecResult = { stdout: string; stderr: string; status: number };

  function fakeExec(
    replay: Record<string, () => ExecResult>,
  ): (cmd: string, args: string[]) => ExecResult {
    return (cmd, args) => {
      const key = `${cmd} ${args.join(" ")}`;
      return replay[key] ? replay[key]() : { stdout: "", stderr: "", status: 0 };
    };
  }

  function catalog(stdout: Record<string, string>) {
    return () => ({
      stdout: JSON.stringify({ workspaces: { catalog: stdout } }),
      stderr: "",
      status: 0,
    });
  }

  const noOpen = () => ({ stdout: "", stderr: "", status: 0 });
  const branchExists = () => ({ stdout: "sha\trefs/heads/deps/x", stderr: "", status: 0 });
  const fetchOk = () => ({ stdout: "", stderr: "", status: 0 });

  function closedPr(prs: { number: number; state: string; closedAt: string }[]) {
    return () => ({
      stdout: JSON.stringify(prs),
      stderr: "",
      status: 0,
    });
  }

  it("holds a version-locked group when no strictly newer version exists", async () => {
    const candidates = [
      makeCandidate({ packageName: "better-auth", latestVersion: "1.6.25", group: "better-auth" }),
      makeCandidate({
        packageName: "@better-auth/expo",
        latestVersion: "1.6.25",
        group: "better-auth",
      }),
    ];
    const branch = branchName("better-auth");
    const exec = fakeExec({
      [`gh pr list --head ${branch} --state open --json number -q .[0].number`]: noOpen,
      [`gh pr list --head ${branch} --state closed --json number,state,closedAt`]: closedPr([
        { number: 379, state: "CLOSED", closedAt: "2026-07-24T00:00:00Z" },
      ]),
      [`git ls-remote --heads origin ${branch}`]: branchExists,
      [`git fetch origin ${branch}`]: fetchOk,
      "git show FETCH_HEAD:package.json": catalog({
        "better-auth": "1.6.25",
        "@better-auth/expo": "1.6.25",
      }),
    });

    const { remaining, held } = await suppressHeldCandidates(candidates, exec);
    expect(remaining).toHaveLength(0);
    expect(held).toHaveLength(1);
    expect(held[0]!.pr).toBe(379);
    expect(held[0]!.packages.sort()).toEqual(["@better-auth/expo", "better-auth"]);
  });

  it("re-proposes a version-locked group when a strictly newer version exists", async () => {
    const candidates = [
      makeCandidate({ packageName: "better-auth", latestVersion: "1.6.26", group: "better-auth" }),
      makeCandidate({
        packageName: "@better-auth/expo",
        latestVersion: "1.6.26",
        group: "better-auth",
      }),
    ];
    const branch = branchName("better-auth");
    const exec = fakeExec({
      [`gh pr list --head ${branch} --state open --json number -q .[0].number`]: noOpen,
      [`gh pr list --head ${branch} --state closed --json number,state,closedAt`]: closedPr([
        { number: 379, state: "CLOSED", closedAt: "2026-07-24T00:00:00Z" },
      ]),
      [`git ls-remote --heads origin ${branch}`]: branchExists,
      [`git fetch origin ${branch}`]: fetchOk,
      "git show FETCH_HEAD:package.json": catalog({ "better-auth": "1.6.25" }),
    });

    const { remaining, held } = await suppressHeldCandidates(candidates, exec);
    expect(remaining).toHaveLength(2);
    expect(held).toHaveLength(0);
  });

  it("holds per-package for a non-version-locked group", async () => {
    const candidates = [
      makeCandidate({
        packageName: "@testing-library/react",
        latestVersion: "1.5.0",
        group: "testing",
      }),
      makeCandidate({
        packageName: "@testing-library/jest-dom",
        latestVersion: "6.0.0",
        group: "testing",
      }),
    ];
    const branch = branchName("testing");
    const exec = fakeExec({
      [`gh pr list --head ${branch} --state open --json number -q .[0].number`]: noOpen,
      [`gh pr list --head ${branch} --state closed --json number,state,closedAt`]: closedPr([
        { number: 20, state: "CLOSED", closedAt: "2026-07-24T00:00:00Z" },
      ]),
      [`git ls-remote --heads origin ${branch}`]: branchExists,
      [`git fetch origin ${branch}`]: fetchOk,
      "git show FETCH_HEAD:package.json": catalog({
        "@testing-library/react": "1.5.0",
        "@testing-library/jest-dom": "1.6.0",
      }),
    });

    const { remaining, held } = await suppressHeldCandidates(candidates, exec);
    expect(remaining.map((c) => c.packageName)).toEqual(["@testing-library/jest-dom"]);
    expect(held).toHaveLength(1);
    expect(held[0]!.packages).toEqual(["@testing-library/react"]);
  });

  it("does not suppress when an open PR exists", async () => {
    const candidates = [
      makeCandidate({ packageName: "better-auth", latestVersion: "1.6.25", group: "better-auth" }),
    ];
    const branch = branchName("better-auth");
    const exec = fakeExec({
      [`gh pr list --head ${branch} --state open --json number -q .[0].number`]: () => ({
        stdout: "379",
        stderr: "",
        status: 0,
      }),
    });

    const { remaining, held } = await suppressHeldCandidates(candidates, exec);
    expect(remaining).toHaveLength(1);
    expect(held).toHaveLength(0);
  });

  it("ignores merged PRs and selects the most recent closed PR", async () => {
    const candidates = [
      makeCandidate({ packageName: "better-auth", latestVersion: "1.6.25", group: "better-auth" }),
    ];
    const branch = branchName("better-auth");
    const exec = fakeExec({
      [`gh pr list --head ${branch} --state open --json number -q .[0].number`]: noOpen,
      [`gh pr list --head ${branch} --state closed --json number,state,closedAt`]: closedPr([
        { number: 400, state: "MERGED", closedAt: "2026-07-25T00:00:00Z" },
        { number: 379, state: "CLOSED", closedAt: "2026-07-24T00:00:00Z" },
      ]),
      [`git ls-remote --heads origin ${branch}`]: branchExists,
      [`git fetch origin ${branch}`]: fetchOk,
      "git show FETCH_HEAD:package.json": catalog({ "better-auth": "1.6.25" }),
    });

    const { remaining, held } = await suppressHeldCandidates(candidates, exec);
    expect(remaining).toHaveLength(0);
    expect(held).toHaveLength(1);
    expect(held[0]!.pr).toBe(379);
  });

  it("does not suppress when the branch is deleted", async () => {
    const candidates = [
      makeCandidate({ packageName: "better-auth", latestVersion: "1.6.25", group: "better-auth" }),
    ];
    const branch = branchName("better-auth");
    const exec = fakeExec({
      [`gh pr list --head ${branch} --state open --json number -q .[0].number`]: noOpen,
      [`gh pr list --head ${branch} --state closed --json number,state,closedAt`]: closedPr([
        { number: 379, state: "CLOSED", closedAt: "2026-07-24T00:00:00Z" },
      ]),
      [`git ls-remote --heads origin ${branch}`]: () => ({ stdout: "", stderr: "", status: 0 }),
    });

    const { remaining, held } = await suppressHeldCandidates(candidates, exec);
    expect(remaining).toHaveLength(1);
    expect(held).toHaveLength(0);
  });
});
