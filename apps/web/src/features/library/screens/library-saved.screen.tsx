"use client";

import styles from "./responsive.module.css";
import { LibrarySavedDesktopWebScreen } from "./library-saved.screen.desktop";
import { LibrarySavedMobileWebScreen } from "./library-saved.screen.mobile";

export type LibrarySavedResponsiveScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibrarySavedResponsiveScreen(props: LibrarySavedResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <LibrarySavedMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <LibrarySavedDesktopWebScreen {...props} />
      </div>
    </>
  );
}
