import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStoredLocale, storeLocale } from "./locale-storage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("expo-localization", () => ({
  getLocales: jest.fn(() => [{ languageCode: "en" }]),
}));

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

describe("getStoredLocale", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns stored locale when one exists", async () => {
    mockGetItem.mockResolvedValue("ar");
    const locale = await getStoredLocale();
    expect(locale).toBe("ar");
  });

  it("falls back to device locale when no stored value", async () => {
    const { getLocales } = require("expo-localization") as { getLocales: jest.Mock };
    getLocales.mockReturnValue([{ languageCode: "ar" }]);
    mockGetItem.mockResolvedValue(null);
    const locale = await getStoredLocale();
    expect(locale).toBe("ar");
  });

  it("returns default locale when stored value is unsupported", async () => {
    mockGetItem.mockResolvedValue("fr");
    const locale = await getStoredLocale();
    expect(locale).toBe("en");
  });

  it("returns default locale when device locale is unsupported", async () => {
    const { getLocales } = require("expo-localization") as { getLocales: jest.Mock };
    getLocales.mockReturnValue([{ languageCode: "fr" }]);
    mockGetItem.mockResolvedValue(null);
    const locale = await getStoredLocale();
    expect(locale).toBe("en");
  });
});

describe("storeLocale", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stores the locale string in AsyncStorage", async () => {
    mockSetItem.mockResolvedValue(undefined);
    await storeLocale("ar");
    expect(mockSetItem).toHaveBeenCalledWith("locale", "ar");
  });
});
