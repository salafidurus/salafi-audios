import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const pluginPath = resolve(import.meta.dir, "index.ts");
const oxlintPath = resolve(import.meta.dir, "../../../node_modules/.bin/oxlint");

function lintFixture(
  source: string,
  relativePath = "apps/fixture/src/fixture.ts",
  baselineSource?: string,
): string {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "require-tsdoc-"));
  const sourcePath = join(fixtureRoot, relativePath);
  const configPath = join(fixtureRoot, "oxlint.json");

  mkdirSync(join(sourcePath, ".."), { recursive: true });
  writeFileSync(sourcePath, source);
  if (baselineSource !== undefined) {
    writeFileSync(
      join(fixtureRoot, ".oxlint-docs-baseline.json"),
      JSON.stringify({
        version: 1,
        files: { [relativePath]: createHash("sha256").update(baselineSource).digest("hex") },
      }),
    );
  }
  writeFileSync(
    configPath,
    JSON.stringify({
      jsPlugins: [{ name: "anti-slop", specifier: pluginPath }],
      rules: { "anti-slop/require-tsdoc": ["error", { scope: "all" }] },
    }),
  );

  try {
    const result = spawnSync(oxlintPath, ["--config", configPath, "--format", "json", sourcePath], {
      encoding: "utf8",
    });
    return `${result.stdout}\n${result.stderr}`;
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

describe("require-tsdoc", () => {
  test("reports missing module documentation", () => {
    const output = lintFixture("export const value = 1;\n");

    expect(output).toContain("require-tsdoc");
    expect(output).toContain("module");
  });

  test("reports missing declaration documentation", () => {
    const output = lintFixture("/** Module summary. */\nexport function value() { return 1; }\n");

    expect(output).toContain("require-tsdoc");
    expect(output).toContain("function");
  });

  test("accepts useful module and declaration TSDoc", () => {
    const output = lintFixture(
      "/** Module summary. */\n/** Returns the configured value. */\nexport function value() { return 1; }\n",
    );

    expect(output).not.toContain("require-tsdoc");
  });

  test("rejects generic placeholder documentation", () => {
    const output = lintFixture(
      "/** Module summary. */\n/** TODO */\nexport function value() { return 1; }\n",
    );

    expect(output).toContain("placeholder");
  });

  test("requires documentation for meaningful fields but exempts structural ids", () => {
    const output = lintFixture(
      "/** Module summary. */\n/** Entity contract. */\nexport interface Entity { id: string; status: string; }\n",
    );

    expect(output).toContain("status");
    expect(output).not.toContain("`id`");
  });

  test("allows overload implementations to inherit the documented public surface", () => {
    const output = lintFixture(
      "/** Module summary. */\n/** Resolves a value. */\nexport function value(input: string): string;\nexport function value(input: number): number;\nexport function value(input: string | number) { return input; }\n",
    );

    expect(output).not.toContain("require-tsdoc");
  });

  test("excludes generated files", () => {
    const output = lintFixture(
      "export const value = 1;\n",
      "apps/fixture/src/generated/fixture.ts",
    );

    expect(output).not.toContain("require-tsdoc");
  });

  test("allows a narrowly scoped structural suppression", () => {
    const output = lintFixture(
      "/** Module summary. */\n// oxlint-disable-next-line anti-slop/require-tsdoc -- framework entrypoint\nexport default function Page() { return null; }\n",
    );

    expect(output).not.toContain("require-tsdoc");
  });

  test("suppresses unchanged legacy findings in the migration baseline", () => {
    const source = "export const value = 1;\n";
    const output = lintFixture(source, undefined, source);

    expect(output).not.toContain("require-tsdoc");
  });

  test("rechecks a baseline file after its source changes", () => {
    const original = "export const value = 1;\n";
    const output = lintFixture("export const value = 2;\n", undefined, original);

    expect(output).toContain("require-tsdoc");
  });
});
