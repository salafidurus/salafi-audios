"use client";

import { Responsive } from "@/shared/components/Responsive";
import { SearchHomeMobileScreen } from "./search-home.screen.mobile";
import { SearchHomeDesktopScreen } from "./search-home.screen.desktop";

export type SearchHomeScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (slug: string) => void;
  onContinueListening?: (lectureSlug: string) => void;
};

export function SearchHomeScreen({
  onOpenSearch,
  onSelectCategory,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
}: SearchHomeScreenProps) {
  return (
    <Responsive
      mobile={
        <SearchHomeMobileScreen
          onOpenSearch={onOpenSearch}
          onSelectCategory={onSelectCategory}
          onSelectScholar={onSelectScholar}
          onSelectSuggestion={onSelectSuggestion}
          onContinueListening={onContinueListening}
        />
      }
      desktop={
        <SearchHomeDesktopScreen
          onOpenSearch={onOpenSearch}
          onSelectCategory={onSelectCategory}
          onSelectScholar={onSelectScholar}
          onSelectSuggestion={onSelectSuggestion}
          onContinueListening={onContinueListening}
        />
      }
    />
  );
}
