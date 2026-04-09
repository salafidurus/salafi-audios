"use client";

import { Responsive } from "@/shared/components/Responsive";
import { FeedFollowingDesktopScreen } from "./feed-following.screen.desktop";
import { FeedFollowingMobileScreen } from "./feed-following.screen.mobile";

export type FeedFollowingScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

export function FeedFollowingScreen(props: FeedFollowingScreenProps) {
  return <Responsive mobile={<FeedFollowingMobileScreen {...props} />} desktop={<FeedFollowingDesktopScreen {...props} />} />;
}
