"use client";

import styles from "./responsive.module.css";
import { FeedRecentDesktopWebScreen } from "./feed-recent.screen.desktop.web";
import { FeedRecentMobileWebScreen } from "./feed-recent.screen.mobile.web";

export type FeedRecentResponsiveScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function FeedRecentResponsiveScreen(props: FeedRecentResponsiveScreenProps) {
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
