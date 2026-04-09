"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminDashboardDesktopScreen } from "./admin-dashboard.screen.desktop";
import { AdminDashboardMobileScreen } from "./admin-dashboard.screen.mobile";

export function AdminDashboardScreen() {
  return <Responsive mobile={<AdminDashboardMobileScreen />} desktop={<AdminDashboardDesktopScreen />} />;
}
