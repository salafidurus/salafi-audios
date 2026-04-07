"use client";

import { useEffect, useState } from "react";
import { useResponsive } from "@sd/shared";
import { TopAuthStripWeb } from "./top-auth-strip.web";

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

  return <TopAuthStripWeb />;
}
