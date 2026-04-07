"use client";

import styles from "../responsive.module.css";
import { SeriesDetailDesktopWebScreen } from "./series-detail.screen.desktop.web";
import { SeriesDetailMobileWebScreen } from "./series-detail.screen.mobile.web";

export type SeriesDetailResponsiveScreenProps = {
  id: string;
  onNavigateToLecture?: (id: string) => void;
};

export function SeriesDetailResponsiveScreen(props: SeriesDetailResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <SeriesDetailMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <SeriesDetailDesktopWebScreen {...props} />
      </div>
    </>
  );
}
