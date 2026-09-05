/** Documents this module's responsibility and public boundary. */
"use client";

import { useNavigationStore } from "../../store/navigation-store";
import { MobileHeader } from "./mobile-header";
import { SidebarDrawer } from "./sidebar-drawer";

/** Coordinates the mobile header trigger with the responsive sidebar drawer state. */
export function SidebarMobile() {
  const { isMobileDrawerOpen, toggleMobileDrawer, closeMobileDrawer } = useNavigationStore();

  return (
    <>
      <MobileHeader onMenuClick={toggleMobileDrawer} />
      <SidebarDrawer isOpen={isMobileDrawerOpen} onClose={closeMobileDrawer} />
    </>
  );
}
