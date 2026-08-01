"use client";

import { useNavigationStore } from "../../store/navigation-store";
import { MobileHeader } from "./mobile-header";
import { SidebarDrawer } from "./sidebar-drawer";

export function SidebarMobile() {
  const { isMobileDrawerOpen, toggleMobileDrawer, closeMobileDrawer } = useNavigationStore();

  return (
    <>
      <MobileHeader onMenuClick={toggleMobileDrawer} />
      <SidebarDrawer isOpen={isMobileDrawerOpen} onClose={closeMobileDrawer} />
    </>
  );
}
