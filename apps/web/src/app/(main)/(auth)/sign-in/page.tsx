"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInResponsiveScreen } from "@/features/auth/screens/sign-in/sign-in.screen";
import { routes } from "@sd/core-contracts";

function SignInPageInner() {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? routes.home;

  return (
    <SignInResponsiveScreen
      redirectTo={redirectTo}
      onNavigateToSignUp={() => push(routes.signUp)}
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
