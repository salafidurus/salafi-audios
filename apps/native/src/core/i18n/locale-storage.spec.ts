import * as SecureStore from "expo-secure-store";
import { getStoredLocale, storeLocale } from "./locale-storage";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

const mockGetItemAsync = SecureStore.getItemAsync as jest.Mock;
const mockSetItemAsync = SecureStore.setItemAsync as jest.Mock;

const originalDateTimeFormat = global.Intl.DateTimeFormat;

function setDeviceLocale(locale: string) {
  (global.Intl as unknown as Record<string, unknown>).DateTimeFormat = jest.fn(() => ({
    resolvedOptions: () => ({ locale }),
  }));
}

describe("getStoredLocale", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setDeviceLocale("en-US");
  });

  afterAll(() => {
    (global.Intl as unknown as Record<string, unknown>).DateTimeFormat = originalDateTimeFormat;
  });

  it("returns stored locale when one exists", async () => {
    mockGetItemAsync.mockResolvedValue("ar");
    const locale = await getStoredLocale();
    expect(locale).toBe("ar");
  });

  it("falls back to device locale when no stored value", async () => {
    setDeviceLocale("ar-SA");
    mockGetItemAsync.mockResolvedValue(null);
    const locale = await getStoredLocale();
    expect(locale).toBe("ar");
  });

  it("returns default locale when stored value is unsupported", async () => {
    mockGetItemAsync.mockResolvedValue("fr");
    const locale = await getStoredLocale();
    expect(locale).toBe("en");
  });

  it("returns default locale when device locale is unsupported", async () => {
    setDeviceLocale("fr-FR");
    mockGetItemAsync.mockResolvedValue(null);
    const locale = await getStoredLocale();
    expect(locale).toBe("en");
  });
});

describe("storeLocale", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stores the locale in SecureStore", async () => {
    mockSetItemAsync.mockResolvedValue(undefined);
    await storeLocale("ar");
    expect(mockSetItemAsync).toHaveBeenCalledWith("locale", "ar");
  });
});
