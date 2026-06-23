"use client";

import Image from "next/image";
import type { ScholarDetailDto } from "@sd/core-contracts";
import { Globe, Youtube, Twitter, Send } from "lucide-react";
import styles from "./scholar-header.module.css";

export type ScholarHeaderProps = {
  scholar: ScholarDetailDto & {
    lectureCount: number;
    seriesCount: number;
    totalDurationSeconds: number;
  };
};

export function ScholarHeader({ scholar }: ScholarHeaderProps) {
  const totalHours = Math.round(scholar.totalDurationSeconds / 3600);

  return (
    <div className={styles.root}>
      {scholar.imageUrl && (
        <Image
          src={scholar.imageUrl}
          alt={scholar.name}
          width={120}
          height={120}
          unoptimized
          className={styles.avatar}
        />
      )}
      <h1 className={styles.name}>{scholar.name}</h1>
      {(scholar.country || scholar.mainLanguage) && (
        <p className={styles.meta}>
          {[scholar.country, scholar.mainLanguage].filter(Boolean).join(" · ")}
        </p>
      )}
      {scholar.bio && <p className={styles.bio}>{scholar.bio}</p>}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{scholar.lectureCount}</span>
          <span className={styles.statLabel}>Lectures</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{scholar.seriesCount}</span>
          <span className={styles.statLabel}>Series</span>
        </div>
        {totalHours > 0 && (
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalHours}h</span>
            <span className={styles.statLabel}>Total</span>
          </div>
        )}
      </div>

      {(scholar.socialTwitter ||
        scholar.socialTelegram ||
        scholar.socialYoutube ||
        scholar.socialWebsite) && (
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
              <Youtube size={18} />
            </a>
          )}
          {scholar.socialTwitter && (
            <a
              href={scholar.socialTwitter}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Twitter"
            >
              <Twitter size={18} />
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
              <Send size={18} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
