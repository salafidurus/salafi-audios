"use client";

import styles from "../responsive.module.css";
import { AdminDashboardDesktopWebScreen } from "./admin-dashboard.screen.desktop.web";
import { AdminDashboardMobileWebScreen } from "./admin-dashboard.screen.mobile.web";

export function AdminDashboardResponsiveScreen() {
  return (
    <>
      <div className={styles.mobileOnly}>
        <AdminDashboardMobileWebScreen />
      </div>
      <div className={styles.desktopOnly}>
        <AdminDashboardDesktopWebScreen />
      </div>
    </>
  );
}
