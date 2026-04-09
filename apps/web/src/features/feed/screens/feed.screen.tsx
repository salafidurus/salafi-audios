"use client";

import { Responsive } from "@/shared/components/Responsive";
import { FeedDesktopWebScreen } from "./feed-recent.screen.desktop";
import { FeedMobileWebScreen } from "./feed-recent.screen.mobile";

export type FeedScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

export function FeedScreen(props: FeedScreenProps) {
  return <Responsive mobile={<FeedMobileWebScreen {...props} />} desktop={<FeedDesktopWebScreen {...props} />} />;
}

export { FeedDesktopWebScreen } from "./feed-recent.screen.desktop";
export { FeedMobileWebScreen } from "./feed-recent.screen.mobile";
export { FeedFollowingDesktopWebScreen } from "./feed-following.screen.desktop";
export { FeedFollowingMobileWebScreen } from "./feed-following.screen.mobile";
