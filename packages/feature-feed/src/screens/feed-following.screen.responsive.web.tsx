"use client";

import styles from "./responsive.module.css";
import { FeedFollowingDesktopWebScreen } from "./feed-following.screen.desktop.web";
import { FeedFollowingMobileWebScreen } from "./feed-following.screen.mobile.web";

export type FeedFollowingResponsiveScreenProps = {
  onNavigateToLecture?: (id: string) => void;
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
