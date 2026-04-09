"use client";

import { useEffect, useState } from "react";
import { useResponsive } from "../../hooks/use-responsive";
import {
  AuthRequiredStateDesktop,
  type AuthRequiredStateDesktopProps,
} from "./AuthRequiredState.desktop";
import { AuthRequiredStateMobile } from "./AuthRequiredState.mobile";

export type AuthRequiredStateProps = AuthRequiredStateDesktopProps;

export function AuthRequiredState(props: AuthRequiredStateProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  if (isMobile || isTablet) {
    return <AuthRequiredStateMobile {...props} />;
  }

  return <AuthRequiredStateDesktop {...props} />;
}
