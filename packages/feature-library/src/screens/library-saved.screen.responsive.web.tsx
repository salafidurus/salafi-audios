"use client";

import styles from "./responsive.module.css";
import { LibrarySavedDesktopWebScreen } from "./library-saved.screen.desktop.web";
import { LibrarySavedMobileWebScreen } from "./library-saved.screen.mobile.web";

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
