import { beforeEach, describe, expect, it, vi } from "bun:test";

import {
  ACCENT_THEME_CHANGE_EVENT,
  ACCENT_THEME_KEY,
  getAccentThemePreference,
  isAccentThemeId,
  setAccentThemePreference,
} from "./accent-theme";

describe("accent-theme preference store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to the standard theme when nothing is stored", () => {
    expect(getAccentThemePreference()).toBe("default");
  });

  it("returns a stored valid accent id", () => {
    window.localStorage.setItem(ACCENT_THEME_KEY, "midnight");
    expect(getAccentThemePreference()).toBe("midnight");
  });

  it("falls back to default for an unknown stored value", () => {
    window.localStorage.setItem(ACCENT_THEME_KEY, "neon");
    expect(getAccentThemePreference()).toBe("default");
  });

  it("persists the chosen id and dispatches a change event", () => {
    const listener = vi.fn();
    window.addEventListener(ACCENT_THEME_CHANGE_EVENT, listener);
    setAccentThemePreference("ember");
    expect(window.localStorage.getItem(ACCENT_THEME_KEY)).toBe("ember");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("isAccentThemeId accepts only known ids", () => {
    expect(isAccentThemeId("default")).toBe(true);
    expect(isAccentThemeId("parchment")).toBe(true);
    expect(isAccentThemeId("manuscript")).toBe(true);
    expect(isAccentThemeId("midnight")).toBe(true);
    expect(isAccentThemeId("ember")).toBe(true);
    expect(isAccentThemeId("neon")).toBe(false);
    expect(isAccentThemeId(null)).toBe(false);
  });
});
