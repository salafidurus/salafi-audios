"use client";

import styles from "../responsive.module.css";
import { AdminDashboardDesktopWebScreen } from "./admin-dashboard.screen.desktop";
import { AdminDashboardMobileWebScreen } from "./admin-dashboard.screen.mobile";

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
