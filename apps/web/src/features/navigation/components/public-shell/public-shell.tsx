"use client";

import { Footer } from "../footer/footer";
import { PublicNavigation } from "../public-navigation/public-navigation";

type PublicShellProps = {
  children: React.ReactNode;
  beforeFooter?: React.ReactNode;
};

export function PublicShell({ children, beforeFooter }: PublicShellProps) {
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
