"use client";

import { Responsive } from "@/shared/components/Responsive";
import { SearchProcessingMobileScreen } from "./search-processing.screen.mobile";
import { SearchProcessingDesktopScreen } from "./search-processing.screen.desktop";

export type SearchProcessingScreenProps = {
  searchKey?: string;
  onBackPress?: () => void;
};

export function SearchProcessingScreen({ searchKey, onBackPress }: SearchProcessingScreenProps) {
  return (
    <Responsive
      mobile={<SearchProcessingMobileScreen prefill={searchKey} onBackPress={onBackPress} />}
      desktop={<SearchProcessingDesktopScreen />}
    />
  );
}
