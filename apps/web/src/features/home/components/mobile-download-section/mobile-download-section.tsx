"use client";

import { AppText } from "@/shared/components/AppText/AppText";
import { StoreDownloadBadge } from "../store-download-badge/store-download-badge";
import { APP_STORE_URL, GOOGLE_PLAY_URL, type MobileAvailability } from "../../screens/home/home.constants";
import styles from "./mobile-download-section.module.css";

export type MobileDownloadSectionProps = {
  availability: MobileAvailability;
};

export function MobileDownloadSection({ availability }: MobileDownloadSectionProps) {
  const iosAvailable = availability === "ios" || availability === "both";
  const androidAvailable = availability === "android" || availability === "both";

  return (
    <section
      className={styles.downloadSection}
      aria-label="Mobile apps download"
      data-testid="mobile-download-section"
    >
      <AppText variant="titleLg" style={{ gridColumn: "1 / -1" }}>
        <span data-testid="mobile-download-title">Coming to Mobile</span>
      </AppText>
      <div className={styles.storeCard} data-testid="app-store-wrapper">
        <AppText variant="titleMd">
          <span>App Store</span>
        </AppText>
        <StoreDownloadBadge store="appStore" isAvailable={iosAvailable} href={APP_STORE_URL} />
      </div>
      <div className={styles.storeCard} data-testid="google-play-wrapper">
        <AppText variant="titleMd">
          <span>Google Play</span>
        </AppText>
        <StoreDownloadBadge store="googlePlay" isAvailable={androidAvailable} href={GOOGLE_PLAY_URL} />
      </div>
    </section>
  );
}
