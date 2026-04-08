"use client";

import styles from "./responsive.module.css";
import { LiveDesktopWebScreen } from "./live.screen.desktop";
import { LiveMobileWebScreen } from "./live.screen.mobile";

export type LiveResponsiveScreenProps = Record<string, never>;

export function LiveResponsiveScreen(_props: LiveResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <LiveMobileWebScreen />
      </div>
      <div className={styles.desktopOnly}>
        <LiveDesktopWebScreen />
      </div>
    </>
  );
}
