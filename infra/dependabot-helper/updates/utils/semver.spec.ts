import { describe, it, expect } from "bun:test";

import { isNewer, categorizeBump } from "./semver";

describe("isNewer", () => {
  it("is false for equal versions", () => {
    expect(isNewer("1.6.25", "1.6.25")).toBe(false);
  });

  it("is false for a lower version", () => {
    expect(isNewer("1.6.24", "1.6.25")).toBe(false);
  });

  it("is true for a strictly greater patch", () => {
    expect(isNewer("1.6.26", "1.6.25")).toBe(true);
  });

  it("is true for a higher major", () => {
    expect(isNewer("2.0.0", "1.9.9")).toBe(true);
  });

  it("is true for a higher minor", () => {
    expect(isNewer("1.7.0", "1.6.9")).toBe(true);
  });

  it("ignores range prefixes", () => {
    expect(isNewer("^1.6.26", "^1.6.25")).toBe(true);
    expect(isNewer("~1.6.25", "1.6.25")).toBe(false);
  });

  it("treats missing parts as zero", () => {
    expect(isNewer("1.6", "1.5.9")).toBe(true);
  });
});

describe("categorizeBump", () => {
  it("returns major for a major bump", () => {
    expect(categorizeBump("1.6.25", "2.0.0")).toBe("major");
  });

  it("returns minor for a minor bump", () => {
    expect(categorizeBump("1.6.25", "1.7.0")).toBe("minor");
  });

  it("returns patch for a patch bump", () => {
    expect(categorizeBump("1.6.25", "1.6.26")).toBe("patch");
  });

  it("returns null when versions are equal or downgraded", () => {
    expect(categorizeBump("1.6.25", "1.6.25")).toBeNull();
    expect(categorizeBump("1.6.25", "1.6.24")).toBeNull();
  });

  it("strips ranges before comparing", () => {
    expect(categorizeBump("^7.29.7", "8.0.1")).toBe("major");
    expect(categorizeBump("^7.29.7", "7.30.0")).toBe("minor");
  });
});
