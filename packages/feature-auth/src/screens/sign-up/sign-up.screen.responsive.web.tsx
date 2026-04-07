"use client";

import { useEffect, useState } from "react";
import { SignUpMobileWebScreen } from "./sign-up.screen.web";
import { SignUpDesktopScreen } from "./sign-up.screen.desktop.web";
import { useResponsive } from "@sd/shared";
import { authClient } from "@sd/core-auth";

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
  const [isHydrated, setIsHydrated] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  if (isMobile || isTablet) {
    return (
      <SignUpMobileWebScreen
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
