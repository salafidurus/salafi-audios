"use client";

import Image from "next/image";
import styles from "./store-download-badge.module.css";

export type StoreDownloadBadgeProps = {
  store: "appStore" | "googlePlay";
  isAvailable: boolean;
  href?: string;
};

export function StoreDownloadBadge({ store, isAvailable, href }: StoreDownloadBadgeProps) {
  const testIdBase = store === "appStore" ? "app-store" : "google-play";

  const badgeSrc =
    store === "appStore"
      ? "/store-buttons/app-store-black-en.svg"
      : "/store-buttons/play-store-en.svg";

  const badgeAlt = store === "appStore" ? "Download on the App Store" : "Get it on Google Play";

  if (isAvailable && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={badgeAlt}
        data-testid={`download-badge-${testIdBase}`}
        className={styles.badgeLink}
      >
        <Image
          src={badgeSrc}
          alt={badgeAlt}
          width={200}
          height={60}
          className={styles.badgeImage}
          priority={false}
        />
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled
      className={styles.badgeButton}
      aria-label={badgeAlt}
      data-testid={`download-badge-${testIdBase}`}
    >
      <Image
        src={badgeSrc}
        alt={badgeAlt}
        width={200}
        height={60}
        className={styles.badgeImage}
        priority={false}
      />
      <span className={styles.comingSoonBadge} data-testid={`coming-soon-badge-${testIdBase}`}>
        Coming soon
      </span>
    </button>
  );
}
