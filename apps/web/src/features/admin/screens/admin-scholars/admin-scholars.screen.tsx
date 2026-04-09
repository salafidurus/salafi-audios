"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminScholarsDesktopWebScreen } from "./admin-scholars.screen.desktop";
import { AdminScholarsMobileWebScreen } from "./admin-scholars.screen.mobile";

export function AdminScholarsScreen() {
  return <Responsive mobile={<AdminScholarsMobileWebScreen />} desktop={<AdminScholarsDesktopWebScreen />} />;
}
