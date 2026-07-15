import { describe, it, expect } from "bun:test";
import { categorizeBump, formatVersionDiff } from "./ui";

describe("ui utils", () => {
  it("categorizeBump detects major", () => {
    expect(categorizeBump("1.0.0", "2.0.0")).toBe("major");
  });

  it("categorizeBump detects minor", () => {
    expect(categorizeBump("1.0.0", "1.1.0")).toBe("minor");
  });

  it("categorizeBump detects patch", () => {
    expect(categorizeBump("1.0.0", "1.0.1")).toBe("patch");
  });

  it("categorizeBump returns null when same", () => {
    expect(categorizeBump("1.0.0", "1.0.0")).toBeNull();
  });

  it("categorizeBump handles semver range prefix", () => {
    expect(categorizeBump("^1.0.0", "2.0.0")).toBe("major");
  });

  it("formatVersionDiff includes arrow", () => {
    const result = formatVersionDiff("^1.0.0", "2.0.0");
    expect(result).toContain("→");
  });
});
