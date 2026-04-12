import { ensureIntlPluralRules } from "./ensure-intl-plural-rules";

describe("ensureIntlPluralRules", () => {
  const originalPluralRules = Intl.PluralRules;

  afterEach(() => {
    Object.defineProperty(Intl, "PluralRules", {
      configurable: true,
      value: originalPluralRules,
      writable: true,
    });
  });

  it("installs a polyfill when the runtime does not provide Intl.PluralRules", () => {
    Object.defineProperty(Intl, "PluralRules", {
      configurable: true,
      value: undefined,
      writable: true,
    });

    ensureIntlPluralRules();

    expect(typeof Intl.PluralRules).toBe("function");

    const englishRules = new Intl.PluralRules("en");
    const arabicRules = new Intl.PluralRules("ar");

    expect(englishRules.select(1)).toBe("one");
    expect(englishRules.select(2)).toBe("other");
    expect(arabicRules.select(0)).toBe("zero");
    expect(arabicRules.select(2)).toBe("two");
    expect(arabicRules.select(7)).toBe("few");
  });

  it("does not replace an existing Intl.PluralRules implementation", () => {
    const existingPluralRules = Intl.PluralRules;

    ensureIntlPluralRules();

    expect(Intl.PluralRules).toBe(existingPluralRules);
  });
});
