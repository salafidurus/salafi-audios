"use client";

import { useEffect, useState } from "react";

const MOBILE_MAX = 640;
export const TABLET_MAX = 900;

type ResponsiveState = {
  isMobile: boolean;
  isTablet: boolean;
  isWeb: boolean;
};

export function useResponsive(): ResponsiveState {
  const [width, setWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth;
    }

    // Default to desktop during SSR so web routes render stable semantic markup.
    return TABLET_MAX + 1;
  });

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth > TABLET_MAX);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return isDesktop;
}
