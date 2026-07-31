import { i18n } from "./i18n";

describe("apps/native i18n bootstrap (regression: core-i18n translations must render)", () => {
  it("returns the real merged translation for a core-i18n key, not the raw key", () => {
    expect(i18n.t("common.loading")).toBe("Loading...");
    expect(i18n.t("common.loading")).not.toBe("common.loading");
  });

  it("has real en resources merged into the shared i18next instance", () => {
    expect(i18n.hasResourceBundle("en", "translation")).toBe(true);
    expect(i18n.getResourceBundle("en", "translation")).toMatchObject({
      common: { loading: "Loading..." },
    });
  });
});
