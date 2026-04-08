"use client";

import { SearchHomeMobileWebScreen } from "./search-home.screen.mobile";
import { SearchHomeDesktopWebScreen } from "./search-home.screen.desktop";
import styles from "../responsive.module.css";

export type SearchHomeResponsiveScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (slug: string) => void;
  onContinueListening?: (lectureSlug: string) => void;
};

export function SearchHomeResponsiveScreen({
  onOpenSearch,
  onSelectCategory,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
}: SearchHomeResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <SearchHomeMobileWebScreen
          onOpenSearch={onOpenSearch}
          onSelectCategory={onSelectCategory}
          onSelectScholar={onSelectScholar}
          onSelectSuggestion={onSelectSuggestion}
          onContinueListening={onContinueListening}
        />
      </div>
      <div className={styles.desktopOnly}>
        <SearchHomeDesktopWebScreen
          onOpenSearch={onOpenSearch}
          onSelectCategory={onSelectCategory}
          onSelectScholar={onSelectScholar}
          onSelectSuggestion={onSelectSuggestion}
          onContinueListening={onContinueListening}
        />
      </div>
    </>
  );
}
