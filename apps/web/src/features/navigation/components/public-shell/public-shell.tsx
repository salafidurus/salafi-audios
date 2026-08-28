/** Documents this module's responsibility and public boundary. */
"use client";

import { Footer } from "../footer/footer";
import { PublicNavigation } from "../public-navigation/public-navigation";

type PublicShellProps = {
  children: React.ReactNode;
  beforeFooter?: React.ReactNode;
  simulateFailure?: boolean;
};

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
