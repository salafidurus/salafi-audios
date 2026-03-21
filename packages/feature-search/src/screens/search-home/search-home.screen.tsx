"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchHomeScreen as MobileSearchHomeScreen } from "../SearchHomeScreen";
import { SearchHomeDesktopScreen } from "./search-home.screen.desktop";
import { useResponsive } from "@sd/shared";

export function SearchHomeScreen() {
  const router = useRouter();
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
