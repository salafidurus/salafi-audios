import { describe, it, expect } from "bun:test";
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

  it("commitChanges returns false when nothing to commit", () => {
    const result = commitChanges("test");
    expect(result).toBe(false);
  });
});
