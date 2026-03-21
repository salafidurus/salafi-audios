"use client";

import { useEffect, useState } from "react";
import { useResponsive } from "../../hooks/use-responsive.desktop.web";
import {
  AuthRequiredStateDesktopWeb,
  type AuthRequiredStateDesktopWebProps,
} from "./AuthRequiredState.desktop.web";
import { AuthRequiredStateMobileWeb } from "./AuthRequiredState.mobile.web";

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
