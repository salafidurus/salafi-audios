import { I18nManager } from "react-native";

import { syncTypographyToLocale } from "../styles/theme/typography-sync";
import { changeLocale } from "./i18n";
import { storeLocale } from "./locale-storage";

jest.mock("./locale-storage", () => ({
  getStoredLocale: jest.fn(),
  storeLocale: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../styles/theme/typography-sync", () => ({
  syncTypographyToLocale: jest.fn(),
}));

jest.mock("expo-updates", () => ({
  reloadAsync: jest.fn().mockResolvedValue(undefined),
}));

describe("changeLocale", () => {
  const originalIsRTL = I18nManager.isRTL;

  afterEach(() => {
    I18nManager.isRTL = originalIsRTL;
  });

  it("re-syncs typography for the new locale", async () => {
    // en is not RTL, so keep I18nManager.isRTL false to skip the reload branch.
    I18nManager.isRTL = false;

    await changeLocale("en");

    expect(storeLocale).toHaveBeenCalledWith("en");
    expect(syncTypographyToLocale).toHaveBeenCalledWith("en");
  });
});
