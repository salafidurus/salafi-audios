"use client";

import { useEffect, useState } from "react";

const MOBILE_MAX = 640;
const TABLET_MAX = 900;

type ResponsiveState = {
  isMobile: boolean;
  isTablet: boolean;
  isWeb: boolean;
};

export function useResponsive(): ResponsiveState {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // During SSR and initial hydration, always return mobile
  if (width === null) {
    return { isMobile: true, isTablet: false, isWeb: false };
  }

  const isMobile = width <= MOBILE_MAX;
  const isTablet = width > MOBILE_MAX && width <= TABLET_MAX;
  const isWeb = width > TABLET_MAX;

  return { isMobile, isTablet, isWeb };
}
