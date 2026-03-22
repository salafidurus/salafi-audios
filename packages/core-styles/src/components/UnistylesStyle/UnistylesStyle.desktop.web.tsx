"use client";

import { useEffect, useRef, type PropsWithChildren, type ReactElement } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { UnistylesRuntime } from "react-native-unistyles";
import {
  getServerUnistyles,
  hydrateServerUnistyles,
  resetServerUnistyles,
} from "react-native-unistyles/server";
import "../../utils/unistyles.web";

export function UnistylesStyleDesktopWeb({ children }: PropsWithChildren): ReactElement {
  const isServerInserted = useRef(false);

  useServerInsertedHTML(() => {
    if (isServerInserted.current) {
      return null;
    }
    isServerInserted.current = true;
    const styles = getServerUnistyles();
    resetServerUnistyles();
    return styles;
  });

  useEffect(() => {
    hydrateServerUnistyles();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const runtime = UnistylesRuntime as typeof UnistylesRuntime & {
      hasAdaptiveThemes?: boolean;
      setAdaptiveThemes?: (isEnabled: boolean) => void;
    };

    if (runtime.hasAdaptiveThemes && runtime.setAdaptiveThemes) {
      runtime.setAdaptiveThemes(false);
    }

    const applyTheme = (themeName: "light" | "dark") => {
      document.documentElement.setAttribute("data-theme", themeName);
      runtime.setTheme(themeName);
    };

    const resolveTheme = (): "light" | "dark" => {
      const explicitTheme = document.documentElement.getAttribute("data-theme");
      if (explicitTheme === "light" || explicitTheme === "dark") {
        return explicitTheme;
      }

      return mediaQuery.matches ? "dark" : "light";
    };

    const syncTheme = () => {
      applyTheme(resolveTheme());
    };

    syncTheme();
    mediaQuery.addEventListener("change", syncTheme);

    return () => {
      mediaQuery.removeEventListener("change", syncTheme);
    };
  }, []);

  return <>{children}</>;
}
