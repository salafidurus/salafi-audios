"use client";

import { ScreenInProgress as MobileScreenInProgress } from "./ScreenInProgress.web";
import { ScreenInProgressDesktop } from "./screen-in-progress.desktop";
import { useResponsive } from "../../hooks/use-responsive.desktop.web";

type ScreenInProgressProps = {
  title?: string;
  description?: string;
};

export function ScreenInProgress({ title, description }: ScreenInProgressProps) {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile || isTablet) {
    return <MobileScreenInProgress />;
  }

  return <ScreenInProgressDesktop title={title} description={description} />;
}
