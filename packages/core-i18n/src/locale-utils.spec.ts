import { resolveLocale, isRtl, localeToDir } from "./locale-utils";

describe("resolveLocale", () => {
  it("returns en for null", () => expect(resolveLocale(null)).toBe("en"));
  it("returns en for empty string", () => expect(resolveLocale("")).toBe("en"));
  it("returns en for unknown locale", () => expect(resolveLocale("fr")).toBe("en"));
  it("resolves ar from exact match", () => expect(resolveLocale("ar")).toBe("ar"));
  it("resolves ar from ar-SA tag", () => expect(resolveLocale("ar-SA")).toBe("ar"));
  it("resolves ar from Accept-Language header", () =>
    expect(resolveLocale("ar-SA,ar;q=0.9,en;q=0.8")).toBe("ar"));
  it("resolves en from en-US", () => expect(resolveLocale("en-US")).toBe("en"));
  it("falls back when all tags unknown", () => expect(resolveLocale("fr-FR,fr;q=0.9")).toBe("en"));
});

describe("isRtl", () => {
  it("returns true for ar", () => expect(isRtl("ar")).toBe(true));
  it("returns false for en", () => expect(isRtl("en")).toBe(false));
});

describe("localeToDir", () => {
  it("returns rtl for ar", () => expect(localeToDir("ar")).toBe("rtl"));
  it("returns ltr for en", () => expect(localeToDir("en")).toBe("ltr"));
});
