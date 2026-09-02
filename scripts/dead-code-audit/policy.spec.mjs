import { describe, expect, test } from "bun:test";

import {
  assertRemovalScope,
  blocksPreparation,
  changedFilesFromDiff,
  findingKey,
  removableUnit,
  scopeIntroducedFindings,
} from "./policy.mjs";

const finding = (overrides = {}) => ({
  category: "confirmed-dead",
  file: "src/orphan.ts",
  name: "orphan",
  type: "export",
  ...overrides,
});

describe("dead-code audit policy", () => {
  test("creates stable keys from finding identity", () => {
    expect(findingKey(finding())).toBe(findingKey(finding()));
    expect(findingKey(finding({ name: "other" }))).not.toBe(findingKey(finding()));
  });

  test("scopes introduced findings to changed files and excludes the baseline", () => {
    const current = [finding(), finding({ file: "src/changed.ts", name: "newFinding" })].map(
      (item) => ({ ...item, key: findingKey(item) }),
    );
    expect(
      scopeIntroducedFindings(current, {
        changedFiles: new Set(["src/changed.ts"]),
        baselineKeys: new Set([current[1].key]),
      }),
    ).toEqual([]);
    expect(
      scopeIntroducedFindings(current, {
        changedFiles: new Set(["src/orphan.ts"]),
      }),
    ).toHaveLength(1);
  });

  test("blocks only confirmed-dead findings", () => {
    expect(blocksPreparation([finding()])).toHaveLength(1);
    expect(blocksPreparation([finding({ category: "likely-dead" })])).toEqual([]);
    expect(blocksPreparation([finding({ category: "unknown/dynamic" })])).toEqual([]);
  });

  test("requires ticket scope, an allowlist, and confirmed findings for removal", () => {
    const item = { ...finding(), key: findingKey(finding()) };
    expect(() => assertRemovalScope({ findings: [item] })).toThrow(/ticket/);
    expect(() => assertRemovalScope({ ticket: 642, allowlist: [], findings: [item] })).toThrow(
      /allowlist/,
    );
    expect(() => assertRemovalScope({ ticket: 642, allowlist: ["missing"], findings: [] })).toThrow(
      /match/,
    );
    expect(() =>
      assertRemovalScope({
        ticket: 642,
        allowlist: [item.key],
        findings: [finding({ category: "likely-dead", key: item.key })],
      }),
    ).toThrow(/confirmed-dead/);
    expect(() =>
      assertRemovalScope({ ticket: 642, allowlist: [item.key], findings: [item] }),
    ).not.toThrow();
  });

  test("parses changed paths from a name-status diff", () => {
    expect(changedFilesFromDiff("M\tsrc/changed.ts\nA\tsrc/new.ts\n")).toEqual(
      new Set(["src/changed.ts", "src/new.ts"]),
    );
  });

  test("rejects symbol findings as whole-file removal units", () => {
    expect(() => removableUnit({ ...finding(), name: "unusedExport" })).toThrow(
      /symbol-level removal/,
    );
    expect(removableUnit({ ...finding(), type: "file", name: "src/orphan.ts" })).toEqual({
      kind: "file",
      file: "src/orphan.ts",
    });
  });

  test("protects framework, public, historical, and generated paths", () => {
    expect(removableUnit({ ...finding(), type: "file", file: "apps/web/src/app/page.tsx" })).toBe(
      null,
    );
    expect(
      removableUnit({
        ...finding(),
        type: "file",
        file: "packages/core-db/prisma/migrations/x.ts",
      }),
    ).toBe(null);
    expect(removableUnit({ ...finding(), type: "file", file: "dist/orphan.js" })).toBe(null);
  });
});
