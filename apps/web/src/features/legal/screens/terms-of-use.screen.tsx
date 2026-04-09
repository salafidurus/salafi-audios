"use client";

import { Responsive } from "@/shared/components/Responsive";
import { TermsOfUseDesktopScreen } from "./terms-of-use.screen.desktop";
import { TermsOfUseMobileScreen } from "./terms-of-use.screen.mobile";

export function TermsOfUseScreen() {
  return <Responsive mobile={<TermsOfUseMobileScreen />} desktop={<TermsOfUseDesktopScreen />} />;
}
