"use client";

import { Responsive } from "@/shared/components/Responsive";
import { FeedFollowingDesktopScreen, type FeedFollowingDesktopScreenProps } from "./explore-following.screen.desktop";
import { FeedFollowingMobileScreen, type FeedFollowingMobileScreenProps } from "./explore-following.screen.mobile";

export type FeedFollowingScreenProps = FeedFollowingDesktopScreenProps & FeedFollowingMobileScreenProps;

export function FeedFollowingScreen(props: FeedFollowingScreenProps) {
  return (
    <Responsive
      mobile={<FeedFollowingMobileScreen {...props} />}
      desktop={<FeedFollowingDesktopScreen {...props} />}
    />
  );
}
