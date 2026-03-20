"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SearchProcessingScreen as MobileSearchProcessingScreen } from "../SearchProcessingScreen";
import { SearchProcessingDesktopScreen } from "./search-processing.screen.desktop";
import { useResponsive } from "@sd/shared";

export function SearchProcessingScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, isTablet } = useResponsive();

  if (isMobile || isTablet) {
    const prefill = searchParams.get("searchKey") ?? undefined;
    return <MobileSearchProcessingScreen prefill={prefill} onBackPress={() => router.back()} />;
  }

  return <SearchProcessingDesktopScreen />;
}
