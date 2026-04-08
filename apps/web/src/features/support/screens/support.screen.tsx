"use client";

import styles from "./responsive.module.css";
import { SupportDesktopWebScreen } from "./support.screen.desktop";
import { SupportMobileWebScreen } from "./support.screen.mobile";

export function SupportResponsiveScreen() {
  return (
    <>
      <div className={styles.mobileOnly}>
        <SupportMobileWebScreen />
      </div>
      <div className={styles.desktopOnly}>
        <SupportDesktopWebScreen />
      </div>
    </>
  );
}
