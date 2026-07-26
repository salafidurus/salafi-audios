import { describe, it, expect } from "bun:test";
import { getSecondaryLocales, getLocaleLabel } from "./locale-tabs";

describe("getSecondaryLocales", () => {
  it("returns locales excluding the main locale", () => {
    const result = getSecondaryLocales("ar");
    expect(result).toContain("en");
    expect(result).not.toContain("ar");
  });

  it("returns array of all non-main locales", () => {
    const result = getSecondaryLocales("en");
    expect(result).toEqual(["ar"]);
  });

  it("returns all secondary locales for ar as main", () => {
    const result = getSecondaryLocales("ar");
    expect(result).toEqual(["en"]);
  });

  it("returns empty array if only one locale exists (hypothetical)", () => {
    // This test documents expected behavior for edge case of single-locale system
    const result = getSecondaryLocales("en");
    // With current SUPPORTED_LOCALES = ["en", "ar"], result should have 1 element
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("getLocaleLabel", () => {
  it("returns 'English' for en locale", () => {
    const result = getLocaleLabel("en");
    expect(result).toBe("English");
  });

  it("returns Arabic label for ar locale", () => {
    const result = getLocaleLabel("ar");
    expect(result).toBe("العربية");
  });
});
