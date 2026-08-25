import { beforeEach, describe, expect, it } from "bun:test";

import { THEME_KEY, getThemeBootstrapScript } from "./theme-bootstrap";

describe("theme bootstrap", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
  });

  it("applies a stored dark preference before the app renders", () => {
    window.localStorage.setItem(THEME_KEY, "dark");

    window.eval(getThemeBootstrapScript());

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("resolves system preference from the browser appearance", () => {
    window.matchMedia = (() => ({ matches: true })) as unknown as typeof window.matchMedia;

    window.eval(getThemeBootstrapScript());

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("falls back to system for invalid stored values", () => {
    window.localStorage.setItem(THEME_KEY, "parchment");
    window.matchMedia = (() => ({ matches: false })) as unknown as typeof window.matchMedia;

    window.eval(getThemeBootstrapScript());

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(document.documentElement).not.toHaveClass("dark");
  });
});
