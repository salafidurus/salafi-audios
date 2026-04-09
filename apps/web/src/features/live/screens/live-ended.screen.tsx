"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LiveEndedDesktopWebScreen } from "./live-ended.screen.desktop";
import { LiveEndedMobileWebScreen } from "./live-ended.screen.mobile";

export type LiveEndedScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

export function LiveEndedScreen(props: LiveEndedScreenProps) {
  return <Responsive mobile={<LiveEndedMobileWebScreen {...props} />} desktop={<LiveEndedDesktopWebScreen {...props} />} />;
}
