"use client";

import { useEffect, useState } from "react";
import { useResponsive } from "@sd/shared";
import { SidebarWeb } from "./sidebar.web";
import { SidebarTablet } from "./sidebar.tablet";
import { SidebarMobile } from "./sidebar.mobile";

export function Sidebar() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  if (isMobile) return <SidebarMobile />;
  if (isTablet) return <SidebarTablet />;
  return <SidebarWeb />;
}
