"use client";

import { useEffect, useState } from "react";
import { useResponsive } from "../../hooks/use-responsive";
import {
  AuthRequiredStateDesktopWeb,
  type AuthRequiredStateDesktopWebProps,
} from "./AuthRequiredState.desktop";
import { AuthRequiredStateMobileWeb } from "./AuthRequiredState.mobile";

export type AuthRequiredStateResponsiveProps = AuthRequiredStateDesktopWebProps;

export function AuthRequiredStateResponsive(props: AuthRequiredStateResponsiveProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  if (isMobile || isTablet) {
    return <AuthRequiredStateMobileWeb {...props} />;
  }

  return <AuthRequiredStateDesktopWeb {...props} />;
}
