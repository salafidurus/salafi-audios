"use client";

import Image from "next/image";
import type { ScholarDetailDto } from "@sd/core-contracts";
import { Globe } from "lucide-react";
import { useTranslation } from "@/core/i18n/use-translation";
import { formatScholarName } from "@/shared/utils/format-scholar-name";
import styles from "./scholar-header.module.css";

export type ScholarHeaderProps = {
  scholar: ScholarDetailDto & {
    lectureCount: number;
    seriesCount: number;
    totalDurationSeconds: number;
    socialFacebook?: string;
    socialInstagram?: string;
  };
};

export function ScholarHeader({ scholar }: ScholarHeaderProps) {
  const { t } = useTranslation();
  const totalHours = Math.round(scholar.totalDurationSeconds / 3600);
  const initial = scholar.name?.trim().charAt(0).toUpperCase() || "?";

  const statsParts = [
    t("scholarContent.statLecturesFormat", "{{count}} Lectures", { count: scholar.lectureCount }),
    t("scholarContent.statSeriesFormat", "{{count}} Series", { count: scholar.seriesCount }),
    totalHours > 0
      ? t("scholarContent.statTotalHoursFormat", "{{hours}}h Total", { hours: totalHours })
      : null,
  ].filter(Boolean);

  const hasSocials =
    scholar.socialWebsite ||
    scholar.socialYoutube ||
    scholar.socialTwitter ||
    scholar.socialTelegram ||
    scholar.socialFacebook ||
    scholar.socialInstagram;

  return (
    <div className={styles.root}>
      {scholar.imageUrl ? (
        <Image
          src={scholar.imageUrl}
          alt={scholar.name}
          width={120}
          height={120}
          unoptimized
          className={styles.avatar}
        />
      ) : (
        <div className={styles.avatarFallback} role="img" aria-label={scholar.name}>
          {initial}
        </div>
      )}

      <div className={styles.infoColumn}>
        {/* Row 1: Name */}
        <h1 className={styles.name}>{formatScholarName(scholar)}</h1>

        {/* Row 2: Stats */}
        <div className={styles.stats}>
          <span className={styles.statText}>{statsParts.join(" · ")}</span>
        </div>

        {/* Row 3: Social Icons */}
        {hasSocials && (
          <div className={styles.socials}>
            {scholar.socialWebsite && (
              <a
                href={scholar.socialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Website"
              >
                <Globe size={18} />
              </a>
            )}
            {scholar.socialYoutube && (
              <a
                href={scholar.socialYoutube}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="YouTube"
              >
                <Image
                  src="/social-icons/youtube-dark.svg"
                  alt="YouTube"
                  width={18}
                  height={18}
                  unoptimized
                />
              </a>
            )}
            {scholar.socialTwitter && (
              <a
                href={scholar.socialTwitter}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="X (Twitter)"
              >
                <Image
                  src="/social-icons/x-dark.svg"
                  alt="X (Twitter)"
                  width={18}
                  height={18}
                  unoptimized
                />
              </a>
            )}
            {scholar.socialTelegram && (
              <a
                href={scholar.socialTelegram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Telegram"
              >
                <Image
                  src="/social-icons/telegram-dark.svg"
                  alt="Telegram"
                  width={18}
                  height={18}
                  unoptimized
                />
              </a>
            )}
            {scholar.socialFacebook && (
              <a
                href={scholar.socialFacebook}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Facebook"
              >
                <Image
                  src="/social-icons/facebook-dark.svg"
                  alt="Facebook"
                  width={18}
                  height={18}
                  unoptimized
                />
              </a>
            )}
            {scholar.socialInstagram && (
              <a
                href={scholar.socialInstagram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Instagram"
              >
                <Image
                  src="/social-icons/instagram-dark.svg"
                  alt="Instagram"
                  width={18}
                  height={18}
                  unoptimized
                />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
