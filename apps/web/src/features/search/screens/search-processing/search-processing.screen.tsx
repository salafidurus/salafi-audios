"use client";

import { Responsive } from "@/shared/components/Responsive";
import { SearchProcessingMobileWebScreen } from "./search-processing.screen.mobile";
import { SearchProcessingDesktopWebScreen } from "./search-processing.screen.desktop";

export type SearchProcessingScreenProps = {
  searchKey?: string;
  onBackPress?: () => void;
};

export function SearchProcessingScreen({ searchKey, onBackPress }: SearchProcessingScreenProps) {
  return (
    <Responsive
      mobile={<SearchProcessingMobileWebScreen prefill={searchKey} onBackPress={onBackPress} />}
      desktop={<SearchProcessingDesktopWebScreen />}
    />
  );
}
