"use client";

import type { ReactNode } from "react";

/**
 * Account layout — renders for everyone (local-first auth mode).
 * Authenticated users see data from the API.
 * Anonymous users see empty state with local storage fallback.
 * Note: /account/legal is publicly accessible regardless of auth.
 */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
