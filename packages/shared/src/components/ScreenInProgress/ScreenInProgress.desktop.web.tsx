"use client";

import { useEffect, useState } from "react";
import { ScreenInProgressMobileWeb } from "./ScreenInProgress.web";
import { ScreenInProgressDesktopWeb } from "./screen-in-progress.desktop";
import { useResponsive } from "../../hooks/use-responsive.desktop.web";

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
