"use client";

import { useSyncExternalStore } from "react";

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
 * Uses useSyncExternalStore for proper SSR hydration without extra renders.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribeToResize,
    () => window.innerWidth > TABLET_MAX,
    () => true,
  );
}
