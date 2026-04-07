"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SignInResponsiveScreen } from "@sd/feature-auth";
import { routes } from "@sd/core-contracts";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? routes.home;

  return (
    <SignInResponsiveScreen
      redirectTo={redirectTo}
      onSignInSuccess={() => router.push(redirectTo)}
      onNavigateToSignUp={() => router.push(routes.signUp)}
    />
  );
}
