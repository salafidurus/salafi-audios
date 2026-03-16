"use client";

import { useResponsive } from "@/shared/hooks/use-responsive";
import { TopAuthStripMobile } from "@/features/navigation/components/top-auth-strip/top-auth-strip.mobile";
import { TopAuthStripTablet } from "@/features/navigation/components/top-auth-strip/top-auth-strip.tablet";
import { TopAuthStripWeb } from "@/features/navigation/components/top-auth-strip/top-auth-strip.web";

export function TopAuthStrip() {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) {
    return <TopAuthStripMobile />;
  }

  if (isTablet) {
    return <TopAuthStripTablet />;
  }

  return <TopAuthStripWeb />;
}
