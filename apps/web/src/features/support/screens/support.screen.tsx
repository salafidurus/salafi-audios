"use client";

import { Responsive } from "@/shared/components/Responsive";
import { SupportDesktopScreen } from "./support.screen.desktop";
import { SupportMobileScreen } from "./support.screen.mobile";

export function SupportScreen() {
  const mobile = <SupportMobileScreen />;
  const desktop = <SupportDesktopScreen />;
  return <Responsive mobile={mobile} desktop={desktop} />;
}
