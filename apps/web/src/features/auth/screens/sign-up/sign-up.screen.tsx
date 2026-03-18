"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SignUpScreen as MobileSignUpScreen } from "@sd/ui-mobile";
import { SignUpDesktopScreen } from "./sign-up.screen.desktop";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { authClient } from "@/core/auth/auth-client";

export function SignUpScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? "/";
  const { isMobile, isTablet } = useResponsive();

  if (isMobile || isTablet) {
    return (
      <MobileSignUpScreen
        onSignUp={async (name, email, password) => {
          const { error } = await authClient.signUp.email({ name, email, password });
          if (error) throw new Error(error.message ?? "Sign up failed");
          router.push(redirectTo);
        }}
        onNavigateToSignIn={() => router.push("/sign-in")}
      />
    );
  }

  return <SignUpDesktopScreen />;
}
