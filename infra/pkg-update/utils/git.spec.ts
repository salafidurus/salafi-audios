import { describe, it, expect, test } from "bun:test";
import { isClean, commitChanges, showDiff } from "./git";

describe("git utils", () => {
  it("isClean returns a boolean", () => {
    const clean = isClean();
    expect(typeof clean).toBe("boolean");
  });

  it("showDiff returns a string", () => {
    const diff = showDiff();
    expect(typeof diff).toBe("string");
  });

  test(
    "commitChanges succeeds or fails gracefully",
    async () => {
      const result = commitChanges("test message");
      expect(typeof result).toBe("boolean");
    },
    { timeout: 30000 },
  );
});
