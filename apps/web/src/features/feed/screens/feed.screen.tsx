"use client";

import { FeedDesktopWebScreen } from "./feed-recent.screen.desktop";
import { FeedMobileWebScreen } from "./feed-recent.screen.mobile";
import styles from "./responsive.module.css";

export type FeedResponsiveScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

export function FeedResponsiveScreen(props: FeedResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <FeedMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <FeedDesktopWebScreen {...props} />
      </div>
    </>
  );
}

export { FeedDesktopWebScreen } from "./feed-recent.screen.desktop";
export { FeedMobileWebScreen } from "./feed-recent.screen.mobile";
export { FeedFollowingDesktopWebScreen } from "./feed-following.screen.desktop";
export { FeedFollowingMobileWebScreen } from "./feed-following.screen.mobile";
