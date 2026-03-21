"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchProcessingScreen as MobileSearchProcessingScreen } from "../SearchProcessingScreen";
import { SearchProcessingDesktopScreen } from "./search-processing.screen.desktop";
import { useResponsive } from "@sd/shared";

export function SearchProcessingScreen() {
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
    return <MobileSearchProcessingScreen prefill={prefill} onBackPress={() => router.back()} />;
  }

  return <SearchProcessingDesktopScreen />;
}
