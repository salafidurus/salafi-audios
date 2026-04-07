"use client";

import { SearchHomeMobileWebScreen } from "./search-home.screen.mobile.web";
import { SearchHomeDesktopWebScreen } from "./search-home.screen.desktop.web";
import styles from "../responsive.module.css";

export type SearchHomeResponsiveScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
};

export function SearchHomeResponsiveScreen({
  onOpenSearch,
  onSelectCategory,
}: SearchHomeResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <SearchHomeMobileWebScreen
          onOpenSearch={onOpenSearch}
          onSelectCategory={onSelectCategory}
        />
      </div>
      <div className={styles.desktopOnly}>
        <SearchHomeDesktopWebScreen
          onOpenSearch={onOpenSearch}
          onSelectCategory={onSelectCategory}
        />
      </div>
    </>
  );
}
