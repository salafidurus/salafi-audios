"use client";

import styles from "../responsive.module.css";
import { ScholarDetailDesktopWebScreen } from "./scholar-detail.screen.desktop.web";
import { ScholarDetailMobileWebScreen } from "./scholar-detail.screen.mobile.web";

export type ScholarDetailResponsiveScreenProps = {
  slug: string;
};

export function ScholarDetailResponsiveScreen(props: ScholarDetailResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <ScholarDetailMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <ScholarDetailDesktopWebScreen {...props} />
      </div>
    </>
  );
}
