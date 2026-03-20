"use client";

import { useResponsive } from "@sd/shared";
import { SidebarWeb } from "./sidebar.web";
import { SidebarTablet } from "./sidebar.tablet";
import { SidebarMobile } from "./sidebar.mobile";

export function Sidebar() {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) return <SidebarMobile />;
  if (isTablet) return <SidebarTablet />;
  return <SidebarWeb />;
}
