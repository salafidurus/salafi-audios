"use client";

import { SignInMobileScreen } from "./sign-in.screen.mobile";
import { SignInDesktopScreen } from "./sign-in.screen.desktop";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useIsHydrated } from "@/shared/hooks/use-is-hydrated";
import { authClient } from "@/core/auth";
import { buildOAuthCallbackURL } from "@/features/auth/oauth-callback-url";

type SignInScreenProps = {
  redirectTo: string;
};

export function SignInResponsiveScreen({ redirectTo }: SignInScreenProps) {
  const isHydrated = useIsHydrated();
  const { isMobile, isTablet } = useResponsive();

  if (!isHydrated) {
    return null;
  }

  if (isMobile || isTablet) {
    return (
      <SignInMobileScreen
        onSignInWithGoogle={() =>
          authClient.signIn.social({
            provider: "google",
            callbackURL: buildOAuthCallbackURL(redirectTo),
          })
        }
        onSignInWithApple={() =>
          authClient.signIn.social({
            provider: "apple",
            callbackURL: buildOAuthCallbackURL(redirectTo),
          })
        }
      />
    );
  }

  return <SignInDesktopScreen redirectTo={redirectTo} />;
}
