"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminScholarsDesktopScreen } from "./admin-scholars.screen.desktop";
import { AdminScholarsMobileScreen } from "./admin-scholars.screen.mobile";

export function AdminScholarsScreen() {
  const mobile = <AdminScholarsMobileScreen />;
  const desktop = <AdminScholarsDesktopScreen />;
  return <Responsive mobile={mobile} desktop={desktop} />;
}
