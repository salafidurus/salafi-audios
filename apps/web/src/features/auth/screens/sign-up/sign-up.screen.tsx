"use client";

import { SignUpMobileScreen } from "./sign-up.screen.mobile";
import { SignUpDesktopScreen } from "./sign-up.screen.desktop";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useIsHydrated } from "@/shared/hooks/use-is-hydrated";
import { authClient } from "@/core/auth";
import { buildOAuthCallbackURL } from "@/features/auth/oauth-callback-url";

type SignUpScreenProps = {
  redirectTo: string;
  onNavigateToSignIn: () => void;
};

export function SignUpResponsiveScreen({ redirectTo, onNavigateToSignIn }: SignUpScreenProps) {
  const isHydrated = useIsHydrated();
  const { isMobile, isTablet } = useResponsive();

  if (!isHydrated) {
    return null;
  }

  if (isMobile || isTablet) {
    return (
      <SignUpMobileScreen
        onSignUpWithGoogle={() =>
          authClient.signIn.social({
            provider: "google",
            callbackURL: buildOAuthCallbackURL(redirectTo),
          })
        }
        onSignUpWithApple={() =>
          authClient.signIn.social({
            provider: "apple",
            callbackURL: buildOAuthCallbackURL(redirectTo),
          })
        }
        onNavigateToSignIn={onNavigateToSignIn}
      />
    );
  }

  return <SignUpDesktopScreen redirectTo={redirectTo} onNavigateToSignIn={onNavigateToSignIn} />;
}
