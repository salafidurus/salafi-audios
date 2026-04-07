"use client";

import styles from "../responsive.module.css";
import { AdminLivestreamsDesktopWebScreen } from "./admin-livestreams.screen.desktop.web";
import { AdminLivestreamsMobileWebScreen } from "./admin-livestreams.screen.mobile.web";

export function AdminLivestreamsResponsiveScreen() {
  return (
    <>
      <div className={styles.mobileOnly}>
        <AdminLivestreamsMobileWebScreen />
      </div>
      <div className={styles.desktopOnly}>
        <AdminLivestreamsDesktopWebScreen />
      </div>
    </>
  );
}
