"use client";

import { Responsive } from "@/shared/components/Responsive";
import { TermsOfUseDesktopWebScreen } from "./terms-of-use.screen.desktop";
import { TermsOfUseMobileWebScreen } from "./terms-of-use.screen.mobile";

export function TermsOfUseScreen() {
  return <Responsive mobile={<TermsOfUseMobileWebScreen />} desktop={<TermsOfUseDesktopWebScreen />} />;
}
