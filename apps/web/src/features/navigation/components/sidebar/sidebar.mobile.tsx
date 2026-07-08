"use client";

import { MobileHeader } from "./mobile-header";
import { SidebarDrawer } from "./sidebar-drawer";
import { useNavigationStore } from "../../store/navigation-store";

export function SidebarMobile() {
  const { isMobileDrawerOpen, openMobileDrawer, closeMobileDrawer } = useNavigationStore();

  return (
    <>
      <MobileHeader onMenuClick={openMobileDrawer} />
      <SidebarDrawer isOpen={isMobileDrawerOpen} onClose={closeMobileDrawer} />
    </>
  );
}
