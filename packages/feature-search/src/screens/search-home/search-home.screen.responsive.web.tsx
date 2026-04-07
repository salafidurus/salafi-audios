"use client";

import { useEffect, useState } from "react";
import { SearchHomeMobileWebScreen } from "./search-home.screen.mobile.web";
import { SearchHomeDesktopWebScreen } from "./search-home.screen.desktop.web";
import { useResponsive } from "@sd/shared";

export type SearchHomeResponsiveScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
};

export function SearchHomeResponsiveScreen({
  onOpenSearch,
  onSelectCategory,
}: SearchHomeResponsiveScreenProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  if (isMobile || isTablet) {
    return (
      <SearchHomeMobileWebScreen onOpenSearch={onOpenSearch} onSelectCategory={onSelectCategory} />
    );
  }

  return (
    <SearchHomeDesktopWebScreen onOpenSearch={onOpenSearch} onSelectCategory={onSelectCategory} />
  );
}
