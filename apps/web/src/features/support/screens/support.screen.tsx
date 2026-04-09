"use client";

import { Responsive } from "@/shared/components/Responsive";
import { SupportDesktopScreen } from "./support.screen.desktop";
import { SupportMobileScreen } from "./support.screen.mobile";

export function SupportScreen() {
  return <Responsive mobile={<SupportMobileScreen />} desktop={<SupportDesktopScreen />} />;
}
