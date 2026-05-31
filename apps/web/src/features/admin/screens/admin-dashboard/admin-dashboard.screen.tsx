"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminDashboardDesktopScreen } from "./admin-dashboard.screen.desktop";
import { AdminDashboardMobileScreen } from "./admin-dashboard.screen.mobile";

export function AdminDashboardScreen() {
  const mobile = <AdminDashboardMobileScreen />;
  const desktop = <AdminDashboardDesktopScreen />;
  return <Responsive mobile={mobile} desktop={desktop} />;
}
