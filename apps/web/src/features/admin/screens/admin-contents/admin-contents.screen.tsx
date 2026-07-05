"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminContentsDesktopScreen } from "./admin-contents.screen.desktop";
import { AdminContentsMobileScreen } from "./admin-contents.screen.mobile";

const MOBILE = <AdminContentsMobileScreen />;
const DESKTOP = <AdminContentsDesktopScreen />;

export function AdminContentsScreen() {
  return <Responsive mobile={MOBILE} desktop={DESKTOP} />;
}
