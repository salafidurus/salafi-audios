"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SearchProcessingScreen as MobileSearchProcessingScreen } from "@sd/ui-mobile";
import { SearchProcessingDesktopScreen } from "./search-processing.screen.desktop";
import { useResponsive } from "@/shared/hooks/use-responsive";

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
