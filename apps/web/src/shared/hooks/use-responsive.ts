"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const MOBILE_MAX = 640;
export const TABLET_MAX = 900;

type ResponsiveState = {
  isMobile: boolean;
  isTablet: boolean;
  isWeb: boolean;
};

function subscribeToResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

export function useResponsive(): ResponsiveState {
  const width = useSyncExternalStore(
    subscribeToResize,
    () => window.innerWidth,
    () => TABLET_MAX + 1,
  );

  const isMobile = width <= MOBILE_MAX;
  const isTablet = width > MOBILE_MAX && width <= TABLET_MAX;
  const isWeb = width > TABLET_MAX;

  return { isMobile, isTablet, isWeb };
}

/**
 * SSR-safe hook that returns true when the viewport is wider than TABLET_MAX.
 * Defaults to `true` (desktop) during SSR so the server and first hydration
 * render match, avoiding hydration mismatches on narrow viewports.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth > TABLET_MAX;
    }
    return true;
  });

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth > TABLET_MAX);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return isDesktop;
}
