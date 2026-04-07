"use client";

import styles from "../responsive.module.css";
import { AdminPermissionsDesktopWebScreen } from "./admin-permissions.screen.desktop.web";
import { AdminPermissionsMobileWebScreen } from "./admin-permissions.screen.mobile.web";

export function AdminPermissionsResponsiveScreen() {
  return (
    <>
      <div className={styles.mobileOnly}>
        <AdminPermissionsMobileWebScreen />
      </div>
      <div className={styles.desktopOnly}>
        <AdminPermissionsDesktopWebScreen />
      </div>
    </>
  );
}
