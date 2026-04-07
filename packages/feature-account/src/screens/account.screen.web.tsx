"use client";

import styles from "./responsive.module.css";
import { AccountDesktopWebScreen } from "./account.screen.desktop.web";
import { AccountMobileWebScreen } from "./account.screen.mobile.web";

export type AccountResponsiveScreenProps = {
  onNavigateToProfile?: () => void;
  onNavigateToLegal?: () => void;
  onSignOut?: () => void;
};

export function AccountResponsiveScreen(props: AccountResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <AccountMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <AccountDesktopWebScreen {...props} />
      </div>
    </>
  );
}
