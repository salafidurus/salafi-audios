"use client";

import { useResponsive } from "@/shared/hooks/use-responsive";
import { useIsHydrated } from "@/shared/hooks/use-is-hydrated";
import { TopAuthStrip as TopAuthStripDesktop } from "./top-auth-strip.desktop";

export function TopAuthStrip() {
  const isHydrated = useIsHydrated();
  const { isWeb } = useResponsive();

  if (!isHydrated) {
    return null;
  }

  // Mobile and tablet use Expo Router navigation, no top auth strip needed
  if (!isWeb) {
    return null;
  }

  return <TopAuthStripDesktop />;
}
