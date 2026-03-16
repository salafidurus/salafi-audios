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

  const isMobile = width !== null ? width <= MOBILE_MAX : false;
  const isTablet = width !== null ? width > MOBILE_MAX && width <= TABLET_MAX : false;
  const isWeb = width !== null ? width > TABLET_MAX : true;

  return { isMobile, isTablet, isWeb };
}
