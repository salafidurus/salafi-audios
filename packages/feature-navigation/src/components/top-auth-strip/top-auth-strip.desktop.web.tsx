"use client";

import { useEffect, useState } from "react";
import { useResponsive } from "@sd/shared";
import { TopAuthStripWeb } from "./top-auth-strip.web";

export function TopAuthStrip() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  // Mobile and tablet use Expo Router navigation, no top auth strip needed
  if (isMobile || isTablet) {
    return null;
  }

  return <TopAuthStripWeb />;
}
