import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repoRoot = join(import.meta.dirname, "..", "..");
const cliPath = join(repoRoot, "scripts", "dead-code-audit", "cli.mjs");

describe("dead-code-audit CLI", () => {
  test("returns normalized report-only findings from a workspace root", async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), "dead-code-audit-"));
    await mkdir(join(fixtureRoot, "src"), { recursive: true });
    await writeFile(
      join(fixtureRoot, "package.json"),
      JSON.stringify({ name: "fixture", type: "module" }),
    );
    await writeFile(
      join(fixtureRoot, "knip.jsonc"),
      JSON.stringify({ entry: ["src/index.js"], project: ["src/**/*.js"] }),
    );
    await writeFile(join(fixtureRoot, "src", "index.js"), 'import "./used.js";\n');
    await writeFile(join(fixtureRoot, "src", "used.js"), "export const used = true;\n");
    await writeFile(join(fixtureRoot, "src", "orphan.js"), "export const orphan = true;\n");

    const result = spawnSync("bun", [cliPath, "--root", fixtureRoot, "--format", "json"], {
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    const report = JSON.parse(result.stdout);
    expect(report.tool).toBe("knip");
    expect(report.mode).toBe("report-only");
    expect(report.summary).toMatchObject({
      blockingCount: 0,
      currentFindingCount: 2,
      introducedCount: 0,
      testFilesReviewed: 0,
    });
    expect(report.testFindings).toEqual([]);
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "confirmed-dead",
          file: "src/orphan.js",
          type: "file",
        }),
      ]),
    );
  });

  test("removes only an explicitly allowlisted placeholder with before-and-after evidence", async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), "dead-code-audit-remove-"));
    await mkdir(join(fixtureRoot, "src"), { recursive: true });
    await writeFile(
      join(fixtureRoot, "package.json"),
      JSON.stringify({ name: "fixture", type: "module" }),
    );
    await writeFile(
      join(fixtureRoot, "knip.jsonc"),
      JSON.stringify({ entry: ["src/index.js"], project: ["src/**/*.{js,mjs}"] }),
    );
    await writeFile(join(fixtureRoot, "src", "index.js"), "export const live = true;\n");
    await writeFile(
      join(fixtureRoot, "src", "orphan.spec.js"),
      "import { test, expect } from 'bun:test'; test('placeholder', () => " +
        "expect(" +
        "true).toBe(true));\n",
    );
    const allowlist = join(fixtureRoot, "allowlist.txt");
    await writeFile(allowlist, "src/orphan.spec.js\n");

    const result = spawnSync(
      "bun",
      [
        cliPath,
        "--root",
        fixtureRoot,
        "--mode",
        "remove",
        "--ticket",
        "642",
        "--allowlist",
        allowlist,
        "--format",
        "json",
      ],
      { encoding: "utf8" },
    );

    expect(result.status).toBe(0);
    const report = JSON.parse(result.stdout);
    expect(report.removal.removedFiles).toEqual(["src/orphan.spec.js"]);
    expect(report.removal.before[0]).toMatchObject({
      category: "confirmed-dead",
      confidence: "high",
    });
    expect(existsSync(join(fixtureRoot, "src", "orphan.spec.js"))).toBe(false);
  });
});
