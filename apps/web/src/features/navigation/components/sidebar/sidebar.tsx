"use client";

import { useResponsive } from "../../../../shared/hooks/use-responsive";
import { useIsHydrated } from "../../../../shared/hooks/use-is-hydrated";
import { Sidebar as SidebarDesktop } from "./sidebar.desktop";
import { SidebarTablet } from "./sidebar.tablet";
import { SidebarMobile } from "./sidebar.mobile";

export function Sidebar() {
  const isHydrated = useIsHydrated();
  const { isMobile, isTablet } = useResponsive();

  if (!isHydrated) {
    return null;
  }

  if (isMobile) return <SidebarMobile />;
  if (isTablet) return <SidebarTablet />;
  return <SidebarDesktop />;
}
