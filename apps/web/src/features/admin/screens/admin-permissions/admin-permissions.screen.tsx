"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminPermissionsDesktopScreen } from "./admin-permissions.screen.desktop";
import { AdminPermissionsMobileScreen } from "./admin-permissions.screen.mobile";

export function AdminPermissionsScreen() {
  return <Responsive mobile={<AdminPermissionsMobileScreen />} desktop={<AdminPermissionsDesktopScreen />} />;
}
