import { changeLocale, i18n } from "./i18n";
import { mergeLocaleMessages } from "./merge-locale-messages";

jest.mock("./locale-storage", () => ({
  getStoredLocale: jest.fn(),
  storeLocale: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../styles/theme/typography-sync", () => ({
  syncTypographyToLocale: jest.fn(),
}));

jest.mock("../styles/theme/direction-sync", () => ({
  syncDirectionToLocale: jest.fn(),
}));

jest.mock("./merge-locale-messages", () => {
  const actual = jest.requireActual("./merge-locale-messages");
  return { mergeLocaleMessages: jest.fn(actual.mergeLocaleMessages) };
});

const mockedMerge = mergeLocaleMessages as jest.Mock;

describe("apps/native i18n lazy locale loading", () => {
  it("loads only the en bundle eagerly at module init", () => {
    expect(i18n.hasResourceBundle("en", "translation")).toBe(true);
    expect(i18n.hasResourceBundle("ar", "translation")).toBe(false);
  });

  it("merges exactly one bundle (en) at module init", () => {
    expect(mockedMerge).toHaveBeenCalledTimes(1);
  });

  it("loads and merges the ar bundle on first changeLocale('ar') call", async () => {
    await changeLocale("ar");

    expect(i18n.hasResourceBundle("ar", "translation")).toBe(true);
    expect(i18n.language).toBe("ar");
    expect(i18n.t("common.loading")).toBe("جارٍ التحميل...");
    expect(mockedMerge).toHaveBeenCalledTimes(2); // en (init) + ar (first switch)
  });

  it("does not re-merge the ar bundle on a subsequent changeLocale('ar') call (cached)", async () => {
    await changeLocale("ar");

    expect(mockedMerge).toHaveBeenCalledTimes(2); // still en + ar — no repeat merge
  });

  describe("initI18n loads the resolved stored locale bundle even when it's not the eager default", () => {
    it("loads the ar bundle when the stored locale is ar", async () => {
      jest.resetModules();
      jest.doMock("./locale-storage", () => ({
        getStoredLocale: jest.fn().mockResolvedValue("ar"),
        storeLocale: jest.fn().mockResolvedValue(undefined),
      }));
      jest.doMock("../styles/theme/typography-sync", () => ({
        syncTypographyToLocale: jest.fn(),
      }));
      jest.doMock("../styles/theme/direction-sync", () => ({
        syncDirectionToLocale: jest.fn(),
      }));

      const fresh = require("./i18n");

      expect(fresh.i18n.hasResourceBundle("ar", "translation")).toBe(false);

      await fresh.initI18n();

      expect(fresh.i18n.hasResourceBundle("ar", "translation")).toBe(true);
      expect(fresh.i18n.t("common.loading")).toBe("جارٍ التحميل...");
    });
  });
});
