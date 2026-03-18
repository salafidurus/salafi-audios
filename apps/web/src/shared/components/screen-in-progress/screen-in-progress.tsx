"use client";

import { ScreenInProgress as MobileScreenInProgress } from "@sd/ui-mobile";
import { ScreenInProgressDesktop } from "./screen-in-progress.desktop";
import { useResponsive } from "@/shared/hooks/use-responsive";

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
