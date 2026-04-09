"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminScholarsDesktopScreen } from "./admin-scholars.screen.desktop";
import { AdminScholarsMobileScreen } from "./admin-scholars.screen.mobile";

export function AdminScholarsScreen() {
  return <Responsive mobile={<AdminScholarsMobileScreen />} desktop={<AdminScholarsDesktopScreen />} />;
}
