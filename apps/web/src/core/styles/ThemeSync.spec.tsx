import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "bun:test";

import { THEME_KEY, ThemeSync } from "./ThemeSync";

const setMode = (mode: string) => window.localStorage.setItem(THEME_KEY, mode);

describe("ThemeSync", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
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

  it("follows browser appearance changes while in system mode", () => {
    let listener: (() => void) | undefined;
    const mediaQuery = {
      matches: false,
      addEventListener: (_event: string, callback: () => void) => {
        listener = callback;
      },
      removeEventListener: () => undefined,
    };
    window.matchMedia = (() => mediaQuery) as unknown as typeof window.matchMedia;

    render(<ThemeSync />);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    mediaQuery.matches = true;
    listener?.();

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });
});
