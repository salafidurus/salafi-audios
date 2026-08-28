import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { CatalogRepairReport } from "../types";

import {
  DEPENDABOT_AUDIT_MARKER,
  formatDependabotAuditComment,
  hasMatchingAuditComment,
  validateDependabotFiles,
} from "../dependabot";

const report: CatalogRepairReport = {
  status: "applied",
  mutations: [
    {
      filePath: "apps/api/package.json",
      workspace: "api",
      dependency: "prisma",
      section: "dependencies",
      before: "catalog:",
      after: "catalog:prisma",
      rule: "prisma-managed",
      reason: "Prisma versions are managed together",
    },
  ],
  updatedFiles: ["apps/api/package.json", "bun.lock"],
  issues: [],
  lockfile: "validated",
};

describe("validateDependabotFiles", () => {
  it("allows dependency manifests, catalog configuration, and the Bun lockfile", () => {
    expect(
      validateDependabotFiles([
        "package.json",
        "apps/api/package.json",
        "catalog.config.json",
        "bun.lock",
      ]),
    ).toEqual({ allowed: true, unexpected: [] });
  });

  it("rejects workflow, source, and arbitrary generated files", () => {
    expect(validateDependabotFiles(["apps/api/src/main.ts", ".github/workflows/x.yml"])).toEqual({
      allowed: false,
      unexpected: ["apps/api/src/main.ts", ".github/workflows/x.yml"],
    });
  });
});

describe("formatDependabotAuditComment", () => {
  it("includes the marker, exact mutations, policy, files, and validation", () => {
    const comment = formatDependabotAuditComment(report, {
      validation: "passed",
      commitSha: "abc123",
    });

    expect(comment).toContain(DEPENDABOT_AUDIT_MARKER);
    expect(comment).toContain("apps/api/package.json");
    expect(comment).toContain("`catalog:` → `catalog:prisma`");
    expect(comment).toContain("prisma-managed");
    expect(comment).toContain("Bun install --ignore-scripts: passed");
    expect(comment).toContain("abc123");
  });

  it("deduplicates an identical audit comment", () => {
    const comment = formatDependabotAuditComment(report, {
      validation: "passed",
      commitSha: "abc123",
    });

    expect(hasMatchingAuditComment([comment], comment)).toBe(true);
    expect(hasMatchingAuditComment([comment.replace("abc123", "different")], comment)).toBe(false);
  });
});

describe("Dependabot workflow safety contract", () => {
  it("keeps the trusted index and stages only dependency files", () => {
    const workflow = readFileSync(
      resolve(import.meta.dirname, "../../../.github/workflows/dependabot-sync.yml"),
      "utf8",
    );

    expect(workflow).toContain("pull-requests: write");
    expect(workflow).toContain("bun infra/dependabot-helper/cli.ts align");
    expect(workflow).toContain("bun infra/dependabot-helper/cli.ts validate-files");
    expect(workflow).toContain("bun infra/dependabot-helper/cli.ts render");
    expect(workflow).not.toContain("bun infra/catalog/");
    expect(workflow).toContain("id: push");
    expect(workflow).toContain(
      "git checkout \"$PR_HEAD_SHA\" -- ':(glob)**/package.json' 'bun.lock' 'catalog.config.json'",
    );
    expect(workflow).toContain(
      "git add -- ':(glob)**/package.json' 'bun.lock' 'catalog.config.json'",
    );
    expect(workflow).not.toContain('git read-tree "$PR_HEAD_SHA"');
    expect(workflow).not.toContain("git add -A");
  });
});

describe("dependency update ownership contract", () => {
  it("keeps Jest ownership separate from the Expo pipeline", () => {
    const dependabot = readFileSync(
      resolve(import.meta.dirname, "../../../.github/dependabot.yml"),
      "utf8",
    );

    expect(dependabot).toContain("test-jest:");
    expect(dependabot).toContain('          - "jest"');
    expect(dependabot).toContain('          - "@types/jest"');
    expect(dependabot).toContain('      - dependency-name: "jest-expo"');
    expect(dependabot).toContain("        exclude-patterns:");
    expect(dependabot).toContain('          - "@types/jest"');

    const jestStart = dependabot.indexOf("      test-jest:");
    const familyStart = dependabot.indexOf("      test-jest-family:");
    expect(jestStart).toBeGreaterThanOrEqual(0);
    expect(familyStart).toBeGreaterThan(jestStart);
    expect(dependabot.slice(jestStart, familyStart)).toContain("          - minor");
    expect(dependabot.slice(jestStart, familyStart)).toContain("          - patch");
    expect(dependabot.slice(jestStart, familyStart)).not.toContain("          - major");
  });
});
