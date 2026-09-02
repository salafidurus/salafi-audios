import {
  applyThemePreference,
  parseThemePreference,
  resolveThemePreference,
} from "./theme-preference";

jest.mock("react-native-unistyles", () => ({
  UnistylesRuntime: {
    setAdaptiveThemes: jest.fn(),
    setTheme: jest.fn(),
  },
}));

const mockedRuntime = jest.requireMock("react-native-unistyles").UnistylesRuntime;

describe("native theme preference", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("accepts only system, light, and dark", () => {
    expect(parseThemePreference("system")).toBe("system");
    expect(parseThemePreference("light")).toBe("light");
    expect(parseThemePreference("dark")).toBe("dark");
    expect(parseThemePreference("neon")).toBe("system");
  });

  it("resolves system against the current OS appearance", () => {
    expect(resolveThemePreference("system", "light")).toBe("light");
    expect(resolveThemePreference("system", "dark")).toBe("dark");
    expect(resolveThemePreference("system", null)).toBe("light");
    expect(resolveThemePreference("dark", "light")).toBe("dark");
  });

  it("uses adaptive mode without setting a concrete theme for system", () => {
    expect(applyThemePreference("system")).toBe("light");
    expect(mockedRuntime.setAdaptiveThemes).toHaveBeenCalledWith(true);
    expect(mockedRuntime.setTheme).not.toHaveBeenCalled();
  });

  it("disables adaptive mode before applying an explicit theme", () => {
    expect(applyThemePreference("dark")).toBe("dark");
    expect(mockedRuntime.setAdaptiveThemes).toHaveBeenCalledWith(false);
    expect(mockedRuntime.setTheme).toHaveBeenCalledWith("dark");
  });
});
