"use client";

import { SignInMobileScreen } from "./sign-in.screen.mobile";
import { SignInDesktopScreen } from "./sign-in.screen.desktop";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useIsHydrated } from "@/shared/hooks/use-is-hydrated";
import { authClient } from "@/core/auth";

type SignInScreenProps = {
  redirectTo: string;
  onNavigateToSignUp: () => void;
};

export function SignInResponsiveScreen({ redirectTo, onNavigateToSignUp }: SignInScreenProps) {
  const isHydrated = useIsHydrated();
  const { isMobile, isTablet } = useResponsive();

  if (!isHydrated) {
    return null;
  }

  if (isMobile || isTablet) {
    return (
      <SignInMobileScreen
        onSignInWithGoogle={() =>
          authClient.signIn.social({ provider: "google", callbackURL: redirectTo })
        }
        onSignInWithApple={() =>
          authClient.signIn.social({ provider: "apple", callbackURL: redirectTo })
        }
        onNavigateToSignUp={onNavigateToSignUp}
      />
    );
  }

  return <SignInDesktopScreen redirectTo={redirectTo} onNavigateToSignUp={onNavigateToSignUp} />;
}
