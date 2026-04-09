"use client";

import { Responsive } from "@/shared/components/Responsive";
import { FeedDesktopWebScreen } from "./feed-recent.screen.desktop";
import { FeedMobileWebScreen } from "./feed-recent.screen.mobile";

export type FeedRecentScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

export function FeedRecentScreen(props: FeedRecentScreenProps) {
  return <Responsive mobile={<FeedMobileWebScreen {...props} />} desktop={<FeedDesktopWebScreen {...props} />} />;
}
