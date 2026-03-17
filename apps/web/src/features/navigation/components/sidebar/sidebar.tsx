"use client";

import { useResponsive } from "@/shared/hooks/use-responsive";
import { SidebarWeb } from "@/features/navigation/components/sidebar/sidebar.web";
import { SidebarTablet } from "@/features/navigation/components/sidebar/sidebar.tablet";
import { SidebarMobile } from "@/features/navigation/components/sidebar/sidebar.mobile";

export function Sidebar() {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) return <SidebarMobile />;
  if (isTablet) return <SidebarTablet />;
  return <SidebarWeb />;
}
