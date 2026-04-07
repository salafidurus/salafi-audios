"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SignUpResponsiveScreen } from "@sd/feature-auth";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? "/";

  return (
    <SignUpResponsiveScreen
      redirectTo={redirectTo}
      onSignUpSuccess={() => router.push(redirectTo)}
      onNavigateToSignIn={() => router.push("/sign-in")}
    />
  );
}
