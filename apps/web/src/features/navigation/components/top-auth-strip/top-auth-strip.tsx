"use client";

import { useEffect, useState } from "react";
import { useResponsive } from "../../../../shared/hooks/use-responsive";
import { TopAuthStrip as TopAuthStripDesktop } from "./top-auth-strip.desktop";

export function TopAuthStrip() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isWeb } = useResponsive();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  // Mobile and tablet use Expo Router navigation, no top auth strip needed
  if (!isWeb) {
    return null;
  }

  return <TopAuthStripDesktop />;
}
