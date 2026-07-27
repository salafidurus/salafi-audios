"use client";

import { routes } from "@sd/core-contracts";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { SignInResponsiveScreen } from "@/features/auth/screens/sign-in/sign-in.screen";

function SignInPageInner() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? routes.home;

  return <SignInResponsiveScreen redirectTo={redirectTo} />;
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageInner />
    </Suspense>
  );
}
