"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LiveScheduledDesktopScreen } from "./live-scheduled.screen.desktop";
import { LiveScheduledMobileScreen } from "./live-scheduled.screen.mobile";

export type LiveScheduledScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

export function LiveScheduledScreen(props: LiveScheduledScreenProps) {
  const mobile = <LiveScheduledMobileScreen {...props} />;
  const desktop = <LiveScheduledDesktopScreen {...props} />;
  return <Responsive mobile={mobile} desktop={desktop} />;
}
