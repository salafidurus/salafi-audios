"use client";

import { FeedFollowingDesktopWebScreen } from "./feed-following.screen.desktop.web";
import { FeedFollowingMobileWebScreen } from "./feed-following.screen.mobile.web";
import styles from "./responsive.module.css";

export type FeedFollowingResponsiveScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

export function FeedFollowingResponsiveScreen(props: FeedFollowingResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <FeedFollowingMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <FeedFollowingDesktopWebScreen {...props} />
      </div>
    </>
  );
}
