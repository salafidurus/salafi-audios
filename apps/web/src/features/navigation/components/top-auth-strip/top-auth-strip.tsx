"use client";

import { usePathname } from "next/navigation";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { TopAuthStripTablet } from "@/features/navigation/components/top-auth-strip/top-auth-strip.tablet";
import { TopAuthStripWeb } from "@/features/navigation/components/top-auth-strip/top-auth-strip.web";

const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export function TopAuthStrip() {
  const pathname = usePathname();
  const { isMobile, isTablet } = useResponsive();

  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return null;
  }

  // Mobile uses expo-router navigation, no top auth strip needed
  if (isMobile) {
    return null;
  }

  if (isTablet) {
    return <TopAuthStripTablet />;
  }

  return <TopAuthStripWeb />;
}
