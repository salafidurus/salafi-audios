"use client";

import { SignUpMobileScreen } from "./sign-up.screen.mobile";
import { SignUpDesktopScreen } from "./sign-up.screen.desktop";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useIsHydrated } from "@/shared/hooks/use-is-hydrated";
import { authClient } from "@/core/auth";

type SignUpScreenProps = {
  redirectTo: string;
  onSignUpSuccess: () => void;
  onNavigateToSignIn: () => void;
};

export function SignUpResponsiveScreen({
  redirectTo,
  onSignUpSuccess,
  onNavigateToSignIn,
}: SignUpScreenProps) {
  const isHydrated = useIsHydrated();
  const { isMobile, isTablet } = useResponsive();

  if (!isHydrated) {
    return null;
  }

  if (isMobile || isTablet) {
    return (
      <SignUpMobileScreen
        onSignUp={async (name, email, password) => {
          const { error } = await authClient.signUp.email({ name, email, password });
          if (error) throw new Error(error.message ?? "Sign up failed");
          onSignUpSuccess();
        }}
        onSignUpWithGoogle={() =>
          authClient.signIn.social({ provider: "google", callbackURL: redirectTo })
        }
        onSignUpWithApple={() =>
          authClient.signIn.social({ provider: "apple", callbackURL: redirectTo })
        }
        onNavigateToSignIn={onNavigateToSignIn}
      />
    );
  }

  return (
    <SignUpDesktopScreen
      redirectTo={redirectTo}
      onSignUpSuccess={onSignUpSuccess}
      onNavigateToSignIn={onNavigateToSignIn}
    />
  );
}
