import { describe, it, expect, mock, beforeAll, afterAll, beforeEach, afterEach } from "bun:test";
import {
  getGroupOrder,
  groupCandidates,
  highestBump,
  branchName,
  worktreeDir,
  buildPrBody,
  runCi,
  type CiOptions,
} from "./ci";
import { clearChangelogCache } from "./utils/changelog";
import type { UpdateCandidate } from "./utils/ui";

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
    const b = makeCandidate({ group: "vitest", packageName: "vitest" });
    const c = makeCandidate({ group: undefined, packageName: "something" });

    const batches = groupCandidates([a, b, c]);
    expect(batches).toHaveLength(3);

    const names = batches.map((b) => b.groupName);
    expect(names).toContain("turbo");
    expect(names).toContain("vitest");
    expect(names).toContain("ungrouped");
  });

  it("returns empty for no candidates", () => {
    expect(groupCandidates([])).toEqual([]);
  });

  it("follows group order (alphabetical between bun/expo and ungrouped)", () => {
    const a = makeCandidate({ group: "ungrouped" });
    const b = makeCandidate({ group: "vitest" });
    const c = makeCandidate({ group: "turbo" });
    const d = makeCandidate({ group: "bun" });

    const batches = groupCandidates([a, b, c, d]);
    const names = batches.map((b) => b.groupName);

    const bunIdx = names.indexOf("bun");
    const turboIdx = names.indexOf("turbo");
    const vitestIdx = names.indexOf("vitest");
    const ungroupedIdx = names.indexOf("ungrouped");
    expect(bunIdx).toBe(0);
    expect(turboIdx).toBeLessThan(vitestIdx);
    expect(turboIdx).toBeLessThan(ungroupedIdx);
    expect(vitestIdx).toBeLessThan(ungroupedIdx);
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

describe("branchName", () => {
  it("formats branch name with deps/ prefix", () => {
    expect(branchName("vitest")).toBe("deps/vitest");
    expect(branchName("bun")).toBe("deps/bun");
    expect(branchName("ungrouped")).toBe("deps/ungrouped");
  });
});

describe("worktreeDir", () => {
  it("generates worktree path under .worktrees", () => {
    const result = worktreeDir("/repo", "vitest");
    expect(result).toContain(".worktrees");
    expect(result).toContain("deps-vitest");
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
  const { mkdtempSync, writeFileSync, mkdirSync } = require("fs") as typeof import("fs");
  const { join } = require("path") as typeof import("path");
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
    expect(existsSync(join(tmpDir, ".worktrees"))).toBe(false);
  });
});
