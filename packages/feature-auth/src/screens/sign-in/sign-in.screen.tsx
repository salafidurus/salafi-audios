"use client";

import { useRouter } from "next/navigation";
import { SignInScreen as MobileSignInScreen } from "../../SignInScreen.web";
import { SignInDesktopScreen } from "./sign-in.screen.desktop";
import { useResponsive } from "@sd/shared";
import { authClient } from "@sd/core-auth";

type SignInScreenProps = {
  redirectTo: string;
};

export function SignInScreen({ redirectTo }: SignInScreenProps) {
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();

  if (isMobile || isTablet) {
    return (
      <MobileSignInScreen
        onSignIn={async (email, password) => {
          const { error } = await authClient.signIn.email({ email, password });
          if (error) throw new Error(error.message ?? "Sign in failed");
          router.push(redirectTo);
        }}
        onSignInWithGoogle={() =>
          authClient.signIn.social({ provider: "google", callbackURL: redirectTo })
        }
        onSignInWithApple={() =>
          authClient.signIn.social({ provider: "apple", callbackURL: redirectTo })
        }
        onNavigateToSignUp={() => router.push("/sign-up")}
      />
    );
  }

  return <SignInDesktopScreen redirectTo={redirectTo} />;
}
