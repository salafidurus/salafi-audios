"use client";

import styles from "./responsive.module.css";
import { LiveEndedDesktopWebScreen } from "./live-ended.screen.desktop";
import { LiveEndedMobileWebScreen } from "./live-ended.screen.mobile";

export type LiveEndedResponsiveScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

export function LiveEndedResponsiveScreen(props: LiveEndedResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <LiveEndedMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <LiveEndedDesktopWebScreen {...props} />
      </div>
    </>
  );
}
