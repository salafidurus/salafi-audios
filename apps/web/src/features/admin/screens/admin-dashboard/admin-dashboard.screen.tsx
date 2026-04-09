"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminDashboardDesktopWebScreen } from "./admin-dashboard.screen.desktop";
import { AdminDashboardMobileWebScreen } from "./admin-dashboard.screen.mobile";

export function AdminDashboardScreen() {
  return <Responsive mobile={<AdminDashboardMobileWebScreen />} desktop={<AdminDashboardDesktopWebScreen />} />;
}
