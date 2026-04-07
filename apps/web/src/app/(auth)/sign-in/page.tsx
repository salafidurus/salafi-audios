"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SignInResponsiveScreen } from "@sd/feature-auth";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? "/";

  return (
    <SignInResponsiveScreen
      redirectTo={redirectTo}
      onSignInSuccess={() => router.push(redirectTo)}
      onNavigateToSignUp={() => router.push("/sign-up")}
    />
  );
}
