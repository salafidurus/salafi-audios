"use client";

import { Responsive } from "@/shared/components/Responsive";
import { FeedFollowingDesktopScreen } from "./feed-following.screen.desktop";
import { FeedFollowingMobileScreen } from "./feed-following.screen.mobile";

export type FeedFollowingScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

export function FeedFollowingScreen(props: FeedFollowingScreenProps) {
  const mobile = <FeedFollowingMobileScreen {...props} />;
  const desktop = <FeedFollowingDesktopScreen {...props} />;
  // react-doctor-disable-next-line react-doctor/jsx-no-jsx-as-prop
  return <Responsive mobile={mobile} desktop={desktop} />;
}
