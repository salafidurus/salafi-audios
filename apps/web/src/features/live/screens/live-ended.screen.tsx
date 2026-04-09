"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LiveEndedDesktopScreen } from "./live-ended.screen.desktop";
import { LiveEndedMobileScreen } from "./live-ended.screen.mobile";

export type LiveEndedScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

export function LiveEndedScreen(props: LiveEndedScreenProps) {
  return <Responsive mobile={<LiveEndedMobileScreen {...props} />} desktop={<LiveEndedDesktopScreen {...props} />} />;
}
