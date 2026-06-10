"use client";

import { Responsive } from "@/shared/components/Responsive";
import { SearchProcessingMobileScreen } from "./search-processing.screen.mobile";
import { SearchProcessingDesktopScreen } from "./search-processing.screen.desktop";

export type SearchProcessingScreenProps = {
  searchKey?: string;
  onBackPress?: () => void;
};

const DESKTOP = <SearchProcessingDesktopScreen />;

export function SearchProcessingScreen({ searchKey, onBackPress }: SearchProcessingScreenProps) {
  const mobile = <SearchProcessingMobileScreen prefill={searchKey} onBackPress={onBackPress} />;
  // react-doctor-disable-next-line react-doctor/jsx-no-jsx-as-prop
  return <Responsive mobile={mobile} desktop={DESKTOP} />;
}
