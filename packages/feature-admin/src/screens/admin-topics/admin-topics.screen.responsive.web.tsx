"use client";

import styles from "../responsive.module.css";
import { AdminTopicsDesktopWebScreen } from "./admin-topics.screen.desktop.web";
import { AdminTopicsMobileWebScreen } from "./admin-topics.screen.mobile.web";

export function AdminTopicsResponsiveScreen() {
  return (
    <>
      <div className={styles.mobileOnly}>
        <AdminTopicsMobileWebScreen />
      </div>
      <div className={styles.desktopOnly}>
        <AdminTopicsDesktopWebScreen />
      </div>
    </>
  );
}
