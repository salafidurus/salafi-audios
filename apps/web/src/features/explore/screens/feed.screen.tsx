"use client";

import { FeedRecentScreen, type FeedRecentScreenProps } from "./explore-recent.screen";

// Export the main feed screen as an alias to FeedRecentScreen
export type FeedScreenProps = FeedRecentScreenProps;

export function FeedScreen(props: FeedScreenProps) {
  return <FeedRecentScreen {...props} />;
}
