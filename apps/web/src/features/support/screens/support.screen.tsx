"use client";

import { Responsive } from "@/shared/components/Responsive";
import { SupportDesktopWebScreen } from "./support.screen.desktop";
import { SupportMobileWebScreen } from "./support.screen.mobile";

export function SupportScreen() {
  return <Responsive mobile={<SupportMobileWebScreen />} desktop={<SupportDesktopWebScreen />} />;
}
