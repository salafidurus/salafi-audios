"use client";

import { Responsive } from "@/shared/components/Responsive";
import { FeedDesktopScreen } from "./feed-recent.screen.desktop";
import { FeedMobileScreen } from "./feed-recent.screen.mobile";

export type FeedScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

export function FeedScreen(props: FeedScreenProps) {
  return (
    <Responsive
      mobile={<FeedMobileScreen {...props} />}
      desktop={<FeedDesktopScreen {...props} />}
    />
  );
}
