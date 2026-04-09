"use client";

import { useResponsive } from "../../hooks/use-responsive";
import { useIsHydrated } from "../../hooks/use-is-hydrated";
import {
  AuthRequiredStateDesktop,
  type AuthRequiredStateDesktopProps,
} from "./AuthRequiredState.desktop";
import { AuthRequiredStateMobile } from "./AuthRequiredState.mobile";

export type AuthRequiredStateProps = AuthRequiredStateDesktopProps;

export function AuthRequiredState(props: AuthRequiredStateProps) {
  const isHydrated = useIsHydrated();
  const { isMobile, isTablet } = useResponsive();

  if (!isHydrated) {
    return null;
  }

  if (isMobile || isTablet) {
    return <AuthRequiredStateMobile {...props} />;
  }

  return <AuthRequiredStateDesktop {...props} />;
}
