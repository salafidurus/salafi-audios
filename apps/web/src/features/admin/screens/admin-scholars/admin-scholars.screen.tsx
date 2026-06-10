"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminScholarsDesktopScreen } from "./admin-scholars.screen.desktop";
import { AdminScholarsMobileScreen } from "./admin-scholars.screen.mobile";

const MOBILE = <AdminScholarsMobileScreen />;
const DESKTOP = <AdminScholarsDesktopScreen />;

export function AdminScholarsScreen() {
  return <Responsive mobile={MOBILE} desktop={DESKTOP} />;
}
