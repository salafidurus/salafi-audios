import { describe, it, expect } from "bun:test";
import { resolveLocale } from "@sd/core-i18n";
import { LOCALE_COOKIE } from "./locale-cookie";

describe("locale-cookie", () => {
  it("LOCALE_COOKIE constant is correct", () => {
    expect(LOCALE_COOKIE).toBe("locale");
  });

  it("resolveLocale returns 'ar' for Arabic cookie value", () => {
    expect(resolveLocale("ar")).toBe("ar");
  });

  it("resolveLocale returns 'en' for English cookie value", () => {
    expect(resolveLocale("en")).toBe("en");
  });

  it("resolveLocale falls back to 'en' for unknown value", () => {
    expect(resolveLocale("fr")).toBe("en");
  });

  it("resolveLocale extracts 'ar' from Accept-Language header", () => {
    expect(resolveLocale("ar-SA,ar;q=0.9,en-US;q=0.8")).toBe("ar");
  });

  it("resolveLocale returns 'en' for null input", () => {
    expect(resolveLocale(null)).toBe("en");
  });
});
