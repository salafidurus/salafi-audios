"use client";

import { useRouter } from "next/navigation";
import { SearchHomeScreen as MobileSearchHomeScreen } from "@sd/ui-mobile";
import { SearchHomeDesktopScreen } from "./search-home.screen.desktop";
import { useResponsive } from "@/shared/hooks/use-responsive";

export function SearchHomeScreen() {
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();

  if (isMobile || isTablet) {
    return (
      <MobileSearchHomeScreen
        onOpenSearch={() => router.push("/searchprocessing")}
        onSelectCategory={(searchKey) =>
          router.push(`/searchprocessing?searchKey=${encodeURIComponent(searchKey)}`)
        }
      />
    );
  }

  return <SearchHomeDesktopScreen />;
}
