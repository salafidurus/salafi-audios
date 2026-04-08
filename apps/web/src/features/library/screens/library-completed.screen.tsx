"use client";

import styles from "./responsive.module.css";
import { LibraryCompletedDesktopWebScreen } from "./library-completed.screen.desktop";
import { LibraryCompletedMobileWebScreen } from "./library-completed.screen.mobile";

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
