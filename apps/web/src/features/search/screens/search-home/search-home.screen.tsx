"use client";

import { Responsive } from "@/shared/components/Responsive";
import type { ListingFormat } from "@sd/core-contracts";
import { SearchHomeMobileScreen } from "./search-home.screen.mobile";
import { SearchHomeDesktopScreen } from "./search-home.screen.desktop";

export type SearchHomeScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (id: string, kind: ListingFormat) => void;
  onContinueListening?: (lectureId: string) => void;
};

export function SearchHomeScreen({
  onOpenSearch,
  onSelectCategory,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
}: SearchHomeScreenProps) {
  const mobile = (
    <SearchHomeMobileScreen
      onOpenSearch={onOpenSearch}
      onSelectCategory={onSelectCategory}
      onSelectScholar={onSelectScholar}
      onSelectSuggestion={onSelectSuggestion}
      onContinueListening={onContinueListening}
    />
  );
  const desktop = (
    <SearchHomeDesktopScreen
      onOpenSearch={onOpenSearch}
      onSelectCategory={onSelectCategory}
      onSelectScholar={onSelectScholar}
      onSelectSuggestion={onSelectSuggestion}
      onContinueListening={onContinueListening}
    />
  );
  // react-doctor-disable-next-line react-doctor/jsx-no-jsx-as-prop
  return <Responsive mobile={mobile} desktop={desktop} />;
}
