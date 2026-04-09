"use client";

import { SignInMobileScreen } from "./sign-in.screen.mobile";
import { SignInDesktopScreen } from "./sign-in.screen.desktop";
import { useResponsive } from "../../../../shared/hooks/use-responsive";
import { useIsHydrated } from "../../../../shared/hooks/use-is-hydrated";
import { authClient } from "../../../../core/auth";

type SignInScreenProps = {
  redirectTo: string;
  onSignInSuccess: () => void;
  onNavigateToSignUp: () => void;
};

export function SignInResponsiveScreen({
  redirectTo,
  onSignInSuccess,
  onNavigateToSignUp,
}: SignInScreenProps) {
  const isHydrated = useIsHydrated();
  const { isMobile, isTablet } = useResponsive();

  if (!isHydrated) {
    return null;
  }

  if (isMobile || isTablet) {
    return (
      <SignInMobileScreen
        onSignIn={async (email, password) => {
          const { error } = await authClient.signIn.email({ email, password });
          if (error) throw new Error(error.message ?? "Sign in failed");
          onSignInSuccess();
        }}
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

  return (
    <SignInDesktopScreen
      redirectTo={redirectTo}
      onSignInSuccess={onSignInSuccess}
      onNavigateToSignUp={onNavigateToSignUp}
    />
  );
}
