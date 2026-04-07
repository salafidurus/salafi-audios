"use client";

import styles from "./responsive.module.css";
import { SupportDesktopWebScreen } from "./support.screen.desktop.web";
import { SupportMobileWebScreen } from "./support.screen.mobile.web";

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
