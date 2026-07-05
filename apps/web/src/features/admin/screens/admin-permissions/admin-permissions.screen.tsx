"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminPermissionsDesktopScreen } from "./admin-permissions.screen.desktop";
import { AdminPermissionsMobileScreen } from "./admin-permissions.screen.mobile";

const MOBILE = <AdminPermissionsMobileScreen />;
const DESKTOP = <AdminPermissionsDesktopScreen />;

export function AdminPermissionsScreen() {
  return <Responsive mobile={MOBILE} desktop={DESKTOP} />;
}
