"use client";

import { useEffect, useState } from "react";
import { SearchProcessingMobileWebScreen } from "./search-processing.screen.mobile.web";
import { SearchProcessingDesktopWebScreen } from "./search-processing.screen.desktop.web";
import { useResponsive } from "@sd/shared";

export type SearchProcessingResponsiveScreenProps = {
  searchKey?: string;
  onBackPress?: () => void;
};

export function SearchProcessingResponsiveScreen({
  searchKey,
  onBackPress,
}: SearchProcessingResponsiveScreenProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  if (isMobile || isTablet) {
    return <SearchProcessingMobileWebScreen prefill={searchKey} onBackPress={onBackPress} />;
  }

  return <SearchProcessingDesktopWebScreen />;
}
