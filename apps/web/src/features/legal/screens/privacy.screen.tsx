"use client";

import { Responsive } from "@/shared/components/Responsive";
import { PrivacyDesktopScreen } from "./privacy.screen.desktop";
import { PrivacyMobileScreen } from "./privacy.screen.mobile";

const MOBILE = <PrivacyMobileScreen />;
const DESKTOP = <PrivacyDesktopScreen />;

export function PrivacyScreen() {
  return <Responsive mobile={MOBILE} desktop={DESKTOP} />;
}
