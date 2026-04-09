"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminPermissionsDesktopWebScreen } from "./admin-permissions.screen.desktop";
import { AdminPermissionsMobileWebScreen } from "./admin-permissions.screen.mobile";

export function AdminPermissionsScreen() {
  return <Responsive mobile={<AdminPermissionsMobileWebScreen />} desktop={<AdminPermissionsDesktopWebScreen />} />;
}
