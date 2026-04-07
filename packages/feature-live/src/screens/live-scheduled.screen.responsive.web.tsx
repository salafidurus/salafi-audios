"use client";

import styles from "./responsive.module.css";
import { LiveScheduledDesktopWebScreen } from "./live-scheduled.screen.desktop.web";
import { LiveScheduledMobileWebScreen } from "./live-scheduled.screen.mobile.web";

export type LiveScheduledResponsiveScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

export function LiveScheduledResponsiveScreen(props: LiveScheduledResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <LiveScheduledMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <LiveScheduledDesktopWebScreen {...props} />
      </div>
    </>
  );
}
