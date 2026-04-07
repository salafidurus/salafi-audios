"use client";

import styles from "./responsive.module.css";
import { TermsOfUseDesktopWebScreen } from "./terms-of-use.screen.desktop.web";
import { TermsOfUseMobileWebScreen } from "./terms-of-use.screen.mobile.web";

export function TermsOfUseResponsiveScreen() {
  return (
    <>
      <div className={styles.mobileOnly}>
        <TermsOfUseMobileWebScreen />
      </div>
      <div className={styles.desktopOnly}>
        <TermsOfUseDesktopWebScreen />
      </div>
    </>
  );
}
