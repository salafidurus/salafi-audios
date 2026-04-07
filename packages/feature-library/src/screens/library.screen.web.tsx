"use client";

import { LibrarySavedDesktopWebScreen } from "./library-saved.screen.desktop.web";
import { LibrarySavedMobileWebScreen } from "./library-saved.screen.mobile.web";
import styles from "./responsive.module.css";

export type LibraryResponsiveScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibraryResponsiveScreen(props: LibraryResponsiveScreenProps) {
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
