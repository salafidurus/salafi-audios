"use client";

import { FeedDesktopWebScreen } from "./feed-recent.screen.desktop.web";
import { FeedMobileWebScreen } from "./feed-recent.screen.mobile.web";
import styles from "./responsive.module.css";

export type FeedRecentResponsiveScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

export function FeedRecentResponsiveScreen(props: FeedRecentResponsiveScreenProps) {
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
