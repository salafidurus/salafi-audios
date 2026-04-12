import * as coreI18n from "../index";

describe("@sd/core-i18n public API", () => {
  it("does not export app-level provider components", () => {
    expect("I18nProvider" in coreI18n).toBe(false);
  });

  it("does not export React hook bindings", () => {
    expect("useTranslation" in coreI18n).toBe(false);
  });
});
