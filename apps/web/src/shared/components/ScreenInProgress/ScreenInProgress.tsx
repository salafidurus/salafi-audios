"use client";

import { useEffect, useState } from "react";
import { ScreenInProgressMobileWeb } from "./ScreenInProgress.mobile";
import { ScreenInProgressDesktopWeb } from "./ScreenInProgress.desktop";
import { useResponsive } from "../../hooks/use-responsive";

type ScreenInProgressProps = {
  title?: string;
  description?: string;
};

export function ScreenInProgressResponsive({ title, description }: ScreenInProgressProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  if (isMobile || isTablet) {
    return <ScreenInProgressMobileWeb />;
  }

  return <ScreenInProgressDesktopWeb title={title} description={description} />;
}
