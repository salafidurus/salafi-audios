import { changeLocale } from "./i18n";
import { storeLocale } from "./locale-storage";

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

describe("changeLocale", () => {
  it("re-syncs typography and direction for the new locale", async () => {
    const { syncTypographyToLocale } = jest.requireMock("../styles/theme/typography-sync") as {
      syncTypographyToLocale: jest.Mock;
    };
    const { syncDirectionToLocale } = jest.requireMock("../styles/theme/direction-sync") as {
      syncDirectionToLocale: jest.Mock;
    };

    await changeLocale("en");

    expect(storeLocale).toHaveBeenCalledWith("en");
    expect(syncTypographyToLocale).toHaveBeenCalledWith("en");
    expect(syncDirectionToLocale).toHaveBeenCalledWith("en");
  });

  it("syncs direction for an RTL locale without forcing an app reload", async () => {
    const { syncDirectionToLocale } = jest.requireMock("../styles/theme/direction-sync") as {
      syncDirectionToLocale: jest.Mock;
    };

    await changeLocale("ar");

    expect(syncDirectionToLocale).toHaveBeenCalledWith("ar");
  });
});
