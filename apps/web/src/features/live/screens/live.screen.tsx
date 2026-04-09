"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LiveDesktopScreen } from "./live.screen.desktop";
import { LiveMobileScreen } from "./live.screen.mobile";

export function LiveScreen() {
  return <Responsive mobile={<LiveMobileScreen />} desktop={<LiveDesktopScreen />} />;
}
