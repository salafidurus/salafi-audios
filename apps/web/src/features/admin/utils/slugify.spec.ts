import { describe, it, expect } from "bun:test";

import { slugify, deriveChildSlug } from "./slugify";

describe("slugify", () => {
  it("lowercases and replaces non-alphanumerics with dashes", () => {
    expect(slugify("Al-Kalam (Part 1)")).toBe("al-kalam-part-1");
  });

  it("collapses consecutive separators and trims edge dashes", () => {
    expect(slugify("  --Weird__ Name--  ")).toBe("weird-name");
  });

  it("drops non-latin characters entirely", () => {
    expect(slugify("درس")).toBe("");
  });
});

describe("deriveChildSlug", () => {
  it("prefixes the parent slug", () => {
    expect(deriveChildSlug("ajurumiyyah", "Al Kalam")).toBe("ajurumiyyah-al-kalam");
  });

  it("falls back to the parent slug when the title slugifies to nothing", () => {
    expect(deriveChildSlug("ajurumiyyah", "درس")).toBe("ajurumiyyah");
  });
});
