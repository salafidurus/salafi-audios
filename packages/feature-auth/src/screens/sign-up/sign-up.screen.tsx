"use client";

import { useRouter } from "next/navigation";
import { SignUpScreen as MobileSignUpScreen } from "../../SignUpScreen.web";
import { SignUpDesktopScreen } from "./sign-up.screen.desktop";
import { useResponsive } from "@sd/shared";
import { authClient } from "@sd/core-auth";

type SignUpScreenProps = {
  redirectTo: string;
};

export function SignUpScreen({ redirectTo }: SignUpScreenProps) {
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();

  if (isMobile || isTablet) {
    return (
      <MobileSignUpScreen
        onSignUp={async (name, email, password) => {
          const { error } = await authClient.signUp.email({ name, email, password });
          if (error) throw new Error(error.message ?? "Sign up failed");
          router.push(redirectTo);
        }}
        onSignUpWithGoogle={() =>
          authClient.signIn.social({ provider: "google", callbackURL: redirectTo })
        }
        onSignUpWithApple={() =>
          authClient.signIn.social({ provider: "apple", callbackURL: redirectTo })
        }
        onNavigateToSignIn={() => router.push("/sign-in")}
      />
    );
  }

  return <SignUpDesktopScreen redirectTo={redirectTo} />;
}
