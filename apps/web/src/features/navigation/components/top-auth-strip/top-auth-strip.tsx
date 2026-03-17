"use client";

import { useResponsive } from "@/shared/hooks/use-responsive";
import { TopAuthStripTablet } from "@/features/navigation/components/top-auth-strip/top-auth-strip.tablet";
import { TopAuthStripWeb } from "@/features/navigation/components/top-auth-strip/top-auth-strip.web";

export function TopAuthStrip() {
  const { isMobile, isTablet } = useResponsive();

  // Mobile uses expo-router navigation, no top auth strip needed
  if (isMobile) {
    return null;
  }

  if (isTablet) {
    return <TopAuthStripTablet />;
  }

  return <TopAuthStripWeb />;
}
