import { UnistylesRuntime } from "react-native-unistyles";

import { syncDirectionToLocale } from "./direction-sync";

jest.mock("react-native-unistyles", () => ({
  UnistylesRuntime: {
    updateTheme: jest.fn(),
  },
}));

describe("syncDirectionToLocale", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls updateTheme for all registered themes", () => {
    syncDirectionToLocale("en");
    expect(UnistylesRuntime.updateTheme).toHaveBeenCalledTimes(5);
    expect(UnistylesRuntime.updateTheme).toHaveBeenCalledWith("system", expect.any(Function));
    expect(UnistylesRuntime.updateTheme).toHaveBeenCalledWith("parchment", expect.any(Function));
    expect(UnistylesRuntime.updateTheme).toHaveBeenCalledWith("manuscript", expect.any(Function));
    expect(UnistylesRuntime.updateTheme).toHaveBeenCalledWith("midnight", expect.any(Function));
    expect(UnistylesRuntime.updateTheme).toHaveBeenCalledWith("ember", expect.any(Function));
  });

  it("sets direction to 'ltr' for a non-RTL locale", () => {
    syncDirectionToLocale("en");
    const updater = (UnistylesRuntime.updateTheme as jest.Mock).mock.calls[0][1];

    const result = updater({} as any);
    expect(result.direction).toBe("ltr");
  });

  it("sets direction to 'rtl' for an RTL locale", () => {
    syncDirectionToLocale("ar");
    const updater = (UnistylesRuntime.updateTheme as jest.Mock).mock.calls[0][1];

    const result = updater({} as any);
    expect(result.direction).toBe("rtl");
  });

  it("preserves other theme fields when updating direction", () => {
    syncDirectionToLocale("ar");
    const updater = (UnistylesRuntime.updateTheme as jest.Mock).mock.calls[0][1];

    const result = updater({
      typography: { displayLg: { fontFamily: "Fraunces-SemiBold" } },
    } as any);
    expect(result.typography.displayLg.fontFamily).toBe("Fraunces-SemiBold");
    expect(result.direction).toBe("rtl");
  });
});
