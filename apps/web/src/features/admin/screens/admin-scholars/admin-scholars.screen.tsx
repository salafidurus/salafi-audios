"use client";

import styles from "../responsive.module.css";
import { AdminScholarsDesktopWebScreen } from "./admin-scholars.screen.desktop";
import { AdminScholarsMobileWebScreen } from "./admin-scholars.screen.mobile";

export function AdminScholarsResponsiveScreen() {
  return (
    <>
      <div className={styles.mobileOnly}>
        <AdminScholarsMobileWebScreen />
      </div>
      <div className={styles.desktopOnly}>
        <AdminScholarsDesktopWebScreen />
      </div>
    </>
  );
}
