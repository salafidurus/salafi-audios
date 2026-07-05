"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminUsersDesktopScreen } from "./admin-users.screen.desktop";
import { AdminUsersMobileScreen } from "./admin-users.screen.mobile";

const MOBILE = <AdminUsersMobileScreen />;
const DESKTOP = <AdminUsersDesktopScreen />;

export function AdminUsersScreen() {
  return <Responsive mobile={MOBILE} desktop={DESKTOP} />;
}
