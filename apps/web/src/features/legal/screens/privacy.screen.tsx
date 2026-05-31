"use client";

import { Responsive } from "@/shared/components/Responsive";
import { PrivacyDesktopScreen } from "./privacy.screen.desktop";
import { PrivacyMobileScreen } from "./privacy.screen.mobile";

export function PrivacyScreen() {
  const mobile = <PrivacyMobileScreen />;
  const desktop = <PrivacyDesktopScreen />;
  return <Responsive mobile={mobile} desktop={desktop} />;
}
