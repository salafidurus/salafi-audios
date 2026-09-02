/** Provides the navigation, content, and footer boundary for public consent pages. */
"use client";

import { Footer } from "../footer/footer";
import { PublicNavigation } from "../public-navigation/public-navigation";

/** Provides the navigation, content, and footer boundary for public consent pages. */
/** Supplies the navigation and footer boundary shared by public consent pages. */
type PublicShellProps = {
  children: React.ReactNode;
  beforeFooter?: React.ReactNode;
  simulateFailure?: boolean;
};

/** Wraps public pages with navigation, consent-aware content spacing, and the footer. */
export function PublicShell({ children, beforeFooter, simulateFailure = false }: PublicShellProps) {
  if (simulateFailure) {
    throw new Error("Intentional public shell failure");
  }

  return (
    <div className="appFrame">
      <div className="appConsentShell">
        <PublicNavigation />
        <div className="appConsentMain">
          <div className="appConsentContent">{children}</div>
          {beforeFooter}
          <Footer />
        </div>
      </div>
    </div>
  );
}
