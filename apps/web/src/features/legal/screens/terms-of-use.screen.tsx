"use client";

import { Responsive } from "@/shared/components/Responsive";
import { TermsOfUseDesktopScreen } from "./terms-of-use.screen.desktop";
import { TermsOfUseMobileScreen } from "./terms-of-use.screen.mobile";

const MOBILE = <TermsOfUseMobileScreen />;
const DESKTOP = <TermsOfUseDesktopScreen />;

export function TermsOfUseScreen() {
  return <Responsive mobile={MOBILE} desktop={DESKTOP} />;
}
