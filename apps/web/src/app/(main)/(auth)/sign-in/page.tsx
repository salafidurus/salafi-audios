"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInResponsiveScreen } from "@sd/feature-auth";
import { routes } from "@sd/core-contracts";

function SignInPageInner() {
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

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageInner />
    </Suspense>
  );
}
