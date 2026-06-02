import { initI18nOptions } from "../i18n";

describe("initI18nOptions", () => {
  it("defaults lng to en", () => {
    const opts = initI18nOptions();
    expect(opts.lng).toBe("en");
    expect(opts.fallbackLng).toBe("en");
  });

  it("uses the provided locale", () => {
    const opts = initI18nOptions({ locale: "ar" });
    expect(opts.lng).toBe("ar");
  });

  it("includes both en and ar in supportedLngs", () => {
    const opts = initI18nOptions();
    expect(opts.supportedLngs).toContain("en");
    expect(opts.supportedLngs).toContain("ar");
  });

  it("sets fallbackLng to en so missing keys do not crash", () => {
    const opts = initI18nOptions({ locale: "ar" });
    expect(opts.fallbackLng).toBe("en");
  });

  it("passes through a resources map", () => {
    const resources = { en: { translation: { hello: "Hello" } } };
    const opts = initI18nOptions({ resources });
    expect(opts.resources).toEqual(resources);
  });

  it("defaults to an empty resources map when none is provided", () => {
    const opts = initI18nOptions();
    expect(opts.resources).toEqual({});
  });

  it("disables escape-value so HTML entities are not double-escaped", () => {
    const opts = initI18nOptions();
    expect((opts.interpolation as { escapeValue: boolean }).escapeValue).toBe(false);
  });

  it("sets defaultNS to translation", () => {
    const opts = initI18nOptions();
    expect(opts.defaultNS).toBe("translation");
  });
});
