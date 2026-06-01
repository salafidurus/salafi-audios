"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LiveEndedDesktopScreen } from "./live-ended.screen.desktop";
import { LiveEndedMobileScreen } from "./live-ended.screen.mobile";

export type LiveEndedScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

export function LiveEndedScreen(props: LiveEndedScreenProps) {
  const mobile = <LiveEndedMobileScreen {...props} />;
  const desktop = <LiveEndedDesktopScreen {...props} />;
  return <Responsive mobile={mobile} desktop={desktop} />;
}
