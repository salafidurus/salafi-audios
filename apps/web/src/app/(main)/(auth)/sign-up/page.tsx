"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignUpResponsiveScreen } from "@sd/feature-auth";
import { routes } from "@sd/core-contracts";

function SignUpPageInner() {
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

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpPageInner />
    </Suspense>
  );
}
