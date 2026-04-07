"use client";

import styles from "./responsive.module.css";
import { LiveDesktopWebScreen } from "./live.screen.desktop.web";
import { LiveMobileWebScreen } from "./live.screen.mobile.web";

export type LiveResponsiveScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

export function LiveResponsiveScreen(props: LiveResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <LiveMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <LiveDesktopWebScreen {...props} />
      </div>
    </>
  );
}
