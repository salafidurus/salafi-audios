"use client";

import { useEffect, useState } from "react";
import { useResponsive } from "@sd/shared";
import { SidebarWeb } from "./sidebar.web";
import { SidebarTablet } from "./sidebar.tablet.web";
import { SidebarMobile } from "./sidebar.mobile.web";

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
