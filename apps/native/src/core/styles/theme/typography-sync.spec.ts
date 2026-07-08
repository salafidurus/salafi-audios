import { syncTypographyToLocale } from "./typography-sync";
import { UnistylesRuntime } from "react-native-unistyles";

jest.mock("react-native-unistyles", () => ({
  UnistylesRuntime: {
    updateTheme: jest.fn(),
  },
}));

describe("syncTypographyToLocale", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls updateTheme for light and dark themes", () => {
    syncTypographyToLocale("en");
    expect(UnistylesRuntime.updateTheme).toHaveBeenCalledTimes(2);
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
