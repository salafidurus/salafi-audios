"use client";

import { useEffect, useState } from "react";
import { SignInMobileWebScreen } from "./sign-in.screen.web";
import { SignInDesktopScreen } from "./sign-in.screen.desktop.web";
import { useResponsive } from "@sd/shared";
import { authClient } from "@sd/core-auth";

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
      <SignInMobileWebScreen
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
