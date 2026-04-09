"use client";

import { Responsive } from "@/shared/components/Responsive";
import { FeedFollowingDesktopWebScreen } from "./feed-following.screen.desktop";
import { FeedFollowingMobileWebScreen } from "./feed-following.screen.mobile";

export type FeedFollowingScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

export function FeedFollowingScreen(props: FeedFollowingScreenProps) {
  return <Responsive mobile={<FeedFollowingMobileWebScreen {...props} />} desktop={<FeedFollowingDesktopWebScreen {...props} />} />;
}
