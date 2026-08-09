import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "bun:test";

import { ACCENT_THEME_CHANGE_EVENT, ACCENT_THEME_KEY } from "./theme/accent-theme";
import { THEME_KEY, ThemeSync } from "./ThemeSync";

const setAccent = (id: string) => window.localStorage.setItem(ACCENT_THEME_KEY, id);
const setMode = (mode: string) => window.localStorage.setItem(THEME_KEY, mode);

describe("ThemeSync", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-accent-theme");
  });

  it("applies the system-based default accent theme when none is stored", () => {
    render(<ThemeSync />);
    expect(document.documentElement).toHaveAttribute("data-accent-theme", "parchment");
  });

  it("applies a stored accent theme on mount", () => {
    setAccent("midnight");
    render(<ThemeSync />);
    expect(document.documentElement).toHaveAttribute("data-accent-theme", "midnight");
  });

  it("keeps applying the light/dark mode preference", () => {
    setMode("dark");
    render(<ThemeSync />);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("re-applies the accent theme when an accent-theme-change event fires", () => {
    render(<ThemeSync />);
    setAccent("ember");
    window.dispatchEvent(new Event(ACCENT_THEME_CHANGE_EVENT));
    expect(document.documentElement).toHaveAttribute("data-accent-theme", "ember");
  });
});
