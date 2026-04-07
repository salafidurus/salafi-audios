"use client";

import { SearchProcessingMobileWebScreen } from "./search-processing.screen.mobile.web";
import { SearchProcessingDesktopWebScreen } from "./search-processing.screen.desktop.web";
import styles from "../responsive.module.css";

export type SearchProcessingResponsiveScreenProps = {
  searchKey?: string;
  onBackPress?: () => void;
};

export function SearchProcessingResponsiveScreen({
  searchKey,
  onBackPress,
}: SearchProcessingResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <SearchProcessingMobileWebScreen prefill={searchKey} onBackPress={onBackPress} />
      </div>
      <div className={styles.desktopOnly}>
        <SearchProcessingDesktopWebScreen />
      </div>
    </>
  );
}
