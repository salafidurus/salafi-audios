"use client";

import { MobileHeader } from "./mobile-header";
import { SidebarDrawer } from "./sidebar-drawer";
import { useNavigationStore } from "../../store/navigation-store";

export function SidebarMobile() {
  const { isMobileDrawerOpen, toggleMobileDrawer, closeMobileDrawer } = useNavigationStore();

  return (
    <>
      <MobileHeader onMenuClick={toggleMobileDrawer} />
      <SidebarDrawer isOpen={isMobileDrawerOpen} onClose={closeMobileDrawer} />
    </>
  );
}
