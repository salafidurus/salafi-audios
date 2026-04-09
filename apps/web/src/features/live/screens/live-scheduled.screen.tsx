"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LiveScheduledDesktopWebScreen } from "./live-scheduled.screen.desktop";
import { LiveScheduledMobileWebScreen } from "./live-scheduled.screen.mobile";

export type LiveScheduledScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

export function LiveScheduledScreen(props: LiveScheduledScreenProps) {
  return <Responsive mobile={<LiveScheduledMobileWebScreen {...props} />} desktop={<LiveScheduledDesktopWebScreen {...props} />} />;
}
