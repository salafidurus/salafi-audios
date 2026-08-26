import { describe, expect, test } from "bun:test";

import { classifyTestFile, normalizeTestSource } from "./test-classification.mjs";

describe("test classification", () => {
  test("keeps safety-sensitive tests conservative", () => {
    expect(
      classifyTestFile({
        file: "auth/permission.spec.ts",
        source: "test('denies access without permission', () => expect(result).toBe(false));",
      }),
    ).toMatchObject({ category: "critical-regression", confidence: "low" });
  });

  test("identifies placeholders and permanent skips", () => {
    expect(
      classifyTestFile({
        file: "placeholder.spec.ts",
        source: "test('todo', () => expect(true));",
      }),
    ).toMatchObject({
      category: "placeholder",
    });
    expect(
      classifyTestFile({ file: "skipped.spec.ts", source: "test.skip('pending', () => {});" }),
    ).toMatchObject({
      category: "permanently-skipped",
    });
  });

  test("normalizes source for exact duplicate review", () => {
    expect(normalizeTestSource('// comment\n test("x", () => {}); ')).toBe('test("x", () => {});');
  });
});
