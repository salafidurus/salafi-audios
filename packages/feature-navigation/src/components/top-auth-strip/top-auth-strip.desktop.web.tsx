"use client";

import { usePathname } from "next/navigation";
import { useResponsive } from "@sd/shared";
import { TopAuthStripTablet } from "./top-auth-strip.tablet";
import { TopAuthStripWeb } from "./top-auth-strip.web";

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
