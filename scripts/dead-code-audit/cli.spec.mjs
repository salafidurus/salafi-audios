import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
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
    expect(report.testFindings).toEqual([]);
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "likely-dead",
          file: "src/orphan.js",
          type: "file",
        }),
      ]),
    );
  });
});
