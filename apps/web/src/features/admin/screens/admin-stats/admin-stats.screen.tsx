"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminStatsDesktopScreen } from "./admin-stats.screen.desktop";
import { AdminStatsMobileScreen } from "./admin-stats.screen.mobile";

const MOBILE = <AdminStatsMobileScreen />;
const DESKTOP = <AdminStatsDesktopScreen />;

export function AdminStatsScreen() {
  return <Responsive mobile={MOBILE} desktop={DESKTOP} />;
}
