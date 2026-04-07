"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SignUpResponsiveScreen } from "@sd/feature-auth";
import { routes } from "@sd/core-contracts";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? routes.home;

  return (
    <SignUpResponsiveScreen
      redirectTo={redirectTo}
      onSignUpSuccess={() => router.push(redirectTo)}
      onNavigateToSignIn={() => router.push(routes.signIn)}
    />
  );
}
