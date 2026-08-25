import { UnistylesRuntime } from "react-native-unistyles";

import { syncTypographyToLocale } from "./typography-sync";

jest.mock("react-native-unistyles", () => ({
  UnistylesRuntime: {
    updateTheme: jest.fn(),
  },
}));

describe("syncTypographyToLocale", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls updateTheme for all registered themes", () => {
    syncTypographyToLocale("en");
    expect(UnistylesRuntime.updateTheme).toHaveBeenCalledTimes(3);
  });

  it("passes correct locale to theme updater for English", () => {
    syncTypographyToLocale("en");
    const updater = (UnistylesRuntime.updateTheme as jest.Mock).mock.calls[0][1];

    const result = updater({} as any);
    expect(result.typography.displayLg.fontFamily).toBe("Fraunces-SemiBold");
  });

  it("passes correct locale to theme updater for Arabic", () => {
    syncTypographyToLocale("ar");
    const updater = (UnistylesRuntime.updateTheme as jest.Mock).mock.calls[0][1];

    const result = updater({} as any);
    expect(result.typography.displayLg.fontFamily).toBe("Alexandria-SemiBold");
  });
});
