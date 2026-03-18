"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SignInScreen as MobileSignInScreen } from "@sd/ui-mobile";
import { SignInDesktopScreen } from "./sign-in.screen.desktop";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { authClient } from "@/core/auth/auth-client";

export function SignInScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? "/";
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

  return <SignInDesktopScreen />;
}
