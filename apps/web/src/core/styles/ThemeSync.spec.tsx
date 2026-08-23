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
    document.documentElement.classList.remove("dark");
  });

  it("applies the system-based default accent theme when none is stored", () => {
    render(<ThemeSync />);
    expect(document.documentElement).toHaveAttribute("data-accent-theme", "parchment");
  });

  it("resolves the accent theme from the stored light/dark mode", () => {
    setAccent("midnight");
    setMode("light");
    render(<ThemeSync />);
    expect(document.documentElement).toHaveAttribute("data-accent-theme", "parchment");
  });

  it("keeps applying the light/dark mode preference", () => {
    setMode("dark");
    render(<ThemeSync />);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("removes the dark variant class when light mode is selected", () => {
    document.documentElement.classList.add("dark");
    setMode("light");
    render(<ThemeSync />);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("re-applies the accent theme when an accent-theme-change event fires", () => {
    render(<ThemeSync />);
    setAccent("ember");
    setMode("dark");
    window.dispatchEvent(new Event(ACCENT_THEME_CHANGE_EVENT));
    expect(document.documentElement).toHaveAttribute("data-accent-theme", "midnight");
  });
});
