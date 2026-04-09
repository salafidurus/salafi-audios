"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LiveDesktopWebScreen } from "./live.screen.desktop";
import { LiveMobileWebScreen } from "./live.screen.mobile";

export function LiveScreen() {
  return <Responsive mobile={<LiveMobileWebScreen />} desktop={<LiveDesktopWebScreen />} />;
}
