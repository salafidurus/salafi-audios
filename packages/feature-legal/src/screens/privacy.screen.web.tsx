"use client";

import styles from "./responsive.module.css";
import { PrivacyDesktopWebScreen } from "./privacy.screen.desktop.web";
import { PrivacyMobileWebScreen } from "./privacy.screen.mobile.web";

export function PrivacyResponsiveScreen() {
  return (
    <>
      <div className={styles.mobileOnly}>
        <PrivacyMobileWebScreen />
      </div>
      <div className={styles.desktopOnly}>
        <PrivacyDesktopWebScreen />
      </div>
    </>
  );
}
