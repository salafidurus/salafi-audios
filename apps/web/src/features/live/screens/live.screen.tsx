"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LiveDesktopScreen } from "./live.screen.desktop";
import { LiveMobileScreen } from "./live.screen.mobile";

const MOBILE = <LiveMobileScreen />;
const DESKTOP = <LiveDesktopScreen />;

export function LiveScreen() {
  return <Responsive mobile={MOBILE} desktop={DESKTOP} />;
}
