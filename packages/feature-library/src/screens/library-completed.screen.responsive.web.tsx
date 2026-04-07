"use client";

import styles from "./responsive.module.css";
import { LibraryCompletedDesktopWebScreen } from "./library-completed.screen.desktop.web";
import { LibraryCompletedMobileWebScreen } from "./library-completed.screen.mobile.web";

export type LibraryCompletedResponsiveScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibraryCompletedResponsiveScreen(props: LibraryCompletedResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <LibraryCompletedMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <LibraryCompletedDesktopWebScreen {...props} />
      </div>
    </>
  );
}
