import { parseThemePreference, resolveThemePreference } from "./theme-preference";

describe("native theme preference", () => {
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
});
