"use client";

import { FeedRecentDesktopWebScreen } from "./feed-recent.screen.desktop.web";
import { FeedRecentMobileWebScreen } from "./feed-recent.screen.mobile.web";
import styles from "./responsive.module.css";

export type FeedResponsiveScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function FeedResponsiveScreen(props: FeedResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <FeedRecentMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <FeedRecentDesktopWebScreen {...props} />
      </div>
    </>
  );
}

export { FeedRecentDesktopWebScreen } from "./feed-recent.screen.desktop.web";
export { FeedRecentMobileWebScreen } from "./feed-recent.screen.mobile.web";
export { FeedFollowingDesktopWebScreen } from "./feed-following.screen.desktop.web";
export { FeedFollowingMobileWebScreen } from "./feed-following.screen.mobile.web";
