"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { routes, routeAuthOverrides, getEffectiveAuthMode, routeAuth } from "@sd/core-contracts";
import { useAuth } from "../../../core/auth/use-auth";

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Check if this specific path has a public override
  const effectiveAuthMode = getEffectiveAuthMode(pathname, routeAuth.account as "auth" | "public");

  // If loading, show nothing (avoid hydration mismatch)
  if (isLoading) {
    return null;
  }

  // If not authenticated and the path is not public, redirect to sign-in
  if (!isAuthenticated && effectiveAuthMode === "auth") {
    router.replace(`${routes.signIn}?redirectTo=${encodeURIComponent(pathname)}`);
    return null;
  }

  return <>{children}</>;
}
