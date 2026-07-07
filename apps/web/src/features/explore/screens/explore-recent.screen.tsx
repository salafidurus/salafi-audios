"use client";

import { Responsive } from "@/shared/components/Responsive";
import { FeedDesktopScreen, type FeedDesktopScreenProps } from "./explore-recent.screen.desktop";
import { FeedMobileScreen, type FeedMobileScreenProps } from "./explore-recent.screen.mobile";

export type FeedRecentScreenProps = FeedDesktopScreenProps & FeedMobileScreenProps;

export function FeedRecentScreen(props: FeedRecentScreenProps) {
  return (
    <Responsive
      mobile={<FeedMobileScreen {...props} />}
      desktop={<FeedDesktopScreen {...props} />}
    />
  );
}
