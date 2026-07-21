"use client";

import Image from "next/image";
import { useTranslation } from "@/core/i18n/use-translation";
import { useIsRtl } from "@/shared/hooks/use-is-rtl";
import styles from "./store-download-badge.module.css";

export type StoreDownloadBadgeProps = {
  store: "appStore" | "googlePlay";
  isAvailable: boolean;
  href?: string;
};

export function StoreDownloadBadge({ store, isAvailable, href }: StoreDownloadBadgeProps) {
  const isRtl = useIsRtl();
  const { t } = useTranslation();

  const testIdBase = store === "appStore" ? "app-store" : "google-play";
  const langSuffix = isRtl ? "ar" : "en";

  const badgeSrc =
    store === "appStore"
      ? `/store-buttons/app-store-black-${langSuffix}.svg`
      : `/store-buttons/play-store-${langSuffix}.svg`;

  const badgeAlt =
    store === "appStore"
      ? t("home.downloadAppStore", "Download on the App Store")
      : t("home.getGooglePlay", "Get it on Google Play");

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
          fill
          sizes="(max-width: 900px) 45vw, 350px"
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
        fill
        sizes="(max-width: 900px) 45vw, 350px"
        className={styles.badgeImage}
        priority={false}
      />
      <span
        className={`${styles.comingSoonBadge} ${isRtl ? styles.comingSoonBadgeRtl : ""}`}
        data-testid={`coming-soon-badge-${testIdBase}`}
      >
        {t("common.comingSoon", "Coming soon")}
      </span>
    </button>
  );
}
