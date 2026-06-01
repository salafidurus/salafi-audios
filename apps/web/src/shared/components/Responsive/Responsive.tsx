"use client";

import { useIsDesktop } from "@/shared/hooks/use-responsive";

export type ResponsiveProps = {
  mobile: React.ReactNode;
  desktop: React.ReactNode;
};

/**
 * Renders exactly one branch based on viewport width.
 *
 * SSR default is desktop (isDesktop=true) so the server and first hydration
 * render match. After the first useEffect the component switches to the mobile
 * branch if the viewport is narrow. Do not render both trees and hide one with
 * CSS — use this component instead.
 */
export function Responsive({ mobile, desktop }: ResponsiveProps) {
  const isDesktop = useIsDesktop();
  return <>{isDesktop ? desktop : mobile}</>;
}
