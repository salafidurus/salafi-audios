"use client";

import styles from "./responsive.module.css";
import { AccountProfileDesktopWebScreen } from "./account-profile.screen.desktop";
import { AccountProfileMobileWebScreen } from "./account-profile.screen.mobile";

export type AccountProfileResponsiveScreenProps = {
  onBack?: () => void;
};

export function AccountProfileResponsiveScreen(props: AccountProfileResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <AccountProfileMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <AccountProfileDesktopWebScreen {...props} />
      </div>
    </>
  );
}
