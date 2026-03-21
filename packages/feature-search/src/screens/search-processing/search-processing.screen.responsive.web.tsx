"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchProcessingMobileWebScreen } from "./search-processing.screen.mobile.web";
import { SearchProcessingDesktopWebScreen } from "./search-processing.screen.desktop.web";
import { useResponsive } from "@sd/shared";

export function SearchProcessingResponsiveScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  if (isMobile || isTablet) {
    const prefill = searchParams.get("searchKey") ?? undefined;
    return <SearchProcessingMobileWebScreen prefill={prefill} onBackPress={() => router.back()} />;
  }

  return <SearchProcessingDesktopWebScreen />;
}
