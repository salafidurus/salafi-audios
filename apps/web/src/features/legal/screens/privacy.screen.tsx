"use client";

import { Responsive } from "@/shared/components/Responsive";
import { PrivacyDesktopWebScreen } from "./privacy.screen.desktop";
import { PrivacyMobileWebScreen } from "./privacy.screen.mobile";

export function PrivacyScreen() {
  return <Responsive mobile={<PrivacyMobileWebScreen />} desktop={<PrivacyDesktopWebScreen />} />;
}
