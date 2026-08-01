import { resolveRouteAccess, routes } from "@sd/core-contracts";
import { Redirect, usePathname } from "expo-router";
import { type ReactNode, useEffect, useRef } from "react";

import { useAuth } from "./use-auth";

/**
 * Registry-driven route guard. Renders a declarative <Redirect> to the sign-in
 * screen when the current path is auth-required and the user is not signed in.
 *
 * Mounted at the (tabs) layout — one level below the root navigator — so the
 * <Redirect> never renders before the root layout is mounted.
 */
export function RouteAccessGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!isLoading) {
      hasMounted.current = true;
    }
  }, [isLoading]);

  // Keep children mounted during background loading updates
  if (isLoading && !hasMounted.current) {
    return null;
  }

  if (resolveRouteAccess(pathname) === "auth-required" && !isAuthenticated) {
    return <Redirect href={{ pathname: routes.signIn, params: { from: pathname } }} />;
  }

  return <>{children}</>;
}
