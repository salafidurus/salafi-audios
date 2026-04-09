"use client";

import styles from "../responsive.module.css";
import { LectureDetailDesktopWebScreen } from "./lecture-detail.screen.desktop";
import { LectureDetailMobileWebScreen } from "./lecture-detail.screen.mobile";

export type LectureDetailResponsiveScreenProps = {
  id: string;
};

export function LectureDetailResponsiveScreen(props: LectureDetailResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <LectureDetailMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <LectureDetailDesktopWebScreen {...props} />
      </div>
    </>
  );
}
