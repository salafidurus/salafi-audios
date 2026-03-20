"use client";

import { useRouter } from "next/navigation";
import { SearchHomeScreen as MobileSearchHomeScreen } from "../SearchHomeScreen";
import { SearchHomeDesktopScreen } from "./search-home.screen.desktop";
import { useResponsive } from "@sd/shared";

export function SearchHomeScreen() {
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();

  if (isMobile || isTablet) {
    return (
      <MobileSearchHomeScreen
        onOpenSearch={() => router.push("/search")}
        onSelectCategory={(searchKey) =>
          router.push(`/search?searchKey=${encodeURIComponent(searchKey)}`)
        }
      />
    );
  }

  return <SearchHomeDesktopScreen />;
}
