"use client";

import styles from "../responsive.module.css";
import { CollectionDetailDesktopWebScreen } from "./collection-detail.screen.desktop.web";
import { CollectionDetailMobileWebScreen } from "./collection-detail.screen.mobile.web";

export type CollectionDetailResponsiveScreenProps = {
  id: string;
  onNavigateToSeries?: (id: string) => void;
};

export function CollectionDetailResponsiveScreen(props: CollectionDetailResponsiveScreenProps) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <CollectionDetailMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <CollectionDetailDesktopWebScreen {...props} />
      </div>
    </>
  );
}
