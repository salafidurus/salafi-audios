"use client";

import { useEffect } from "react";

export function ThemeSync() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const resolveTheme = (): "light" | "dark" => {
      const explicitTheme = document.documentElement.getAttribute("data-theme");
      if (explicitTheme === "light" || explicitTheme === "dark") {
        return explicitTheme;
      }
      return mediaQuery.matches ? "dark" : "light";
    };

    const syncTheme = () => {
      document.documentElement.setAttribute("data-theme", resolveTheme());
    };

    syncTheme();
    mediaQuery.addEventListener("change", syncTheme);
    return () => mediaQuery.removeEventListener("change", syncTheme);
  }, []);

  return null;
}
