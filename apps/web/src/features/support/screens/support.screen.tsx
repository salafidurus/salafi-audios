"use client";

import { Responsive } from "@/shared/components/Responsive";
import { SupportDesktopScreen } from "./support.screen.desktop";
import { SupportMobileScreen } from "./support.screen.mobile";

const MOBILE = <SupportMobileScreen />;
const DESKTOP = <SupportDesktopScreen />;

export function SupportScreen() {
  return <Responsive mobile={MOBILE} desktop={DESKTOP} />;
}
