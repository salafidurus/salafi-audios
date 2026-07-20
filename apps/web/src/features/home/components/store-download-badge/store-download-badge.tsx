"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./store-download-badge.module.css";

export type StoreDownloadBadgeProps = {
  store: "appStore" | "googlePlay";
  isAvailable: boolean;
  href?: string;
};

export function StoreDownloadBadge({ store, isAvailable, href }: StoreDownloadBadgeProps) {
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    const updateLanguage = () => {
      const htmlDir = document.documentElement.dir;
      const htmlLang = document.documentElement.lang;
      setIsRtl(htmlDir === "rtl" || htmlLang?.startsWith("ar"));
    };

    updateLanguage();

    const observer = new MutationObserver(updateLanguage);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir", "lang"],
    });

    return () => observer.disconnect();
  }, []);

  const testIdBase = store === "appStore" ? "app-store" : "google-play";
  const langSuffix = isRtl ? "ar" : "en";

  const badgeSrc =
    store === "appStore"
      ? `/store-buttons/app-store-black-${langSuffix}.svg`
      : `/store-buttons/play-store-${langSuffix}.svg`;

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
      <span
        className={`${styles.comingSoonBadge} ${isRtl ? styles.comingSoonBadgeRtl : ""}`}
        data-testid={`coming-soon-badge-${testIdBase}`}
      >
        Coming soon
      </span>
    </button>
  );
}
