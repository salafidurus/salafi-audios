"use client";

import { useState } from "react";
import Image from "next/image";
import type { ScholarDetailDto } from "@sd/core-contracts";
import { Globe, Send } from "lucide-react";
import styles from "./scholar-header.module.css";

function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.54a29 29 0 0 0 .46 5.12 2.78 2.78 0 0 0 1.95 1.96C5.12 19.08 12 19.08 12 19.08s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.12 29 29 0 0 0-.46-5.12z" />
      <polygon points="9.75 15.02 15.5 11.54 9.75 8.06 9.75 15.02" />
    </svg>
  );
}

function TwitterIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

export type ScholarHeaderProps = {
  scholar: ScholarDetailDto & {
    lectureCount: number;
    seriesCount: number;
    totalDurationSeconds: number;
  };
};

export function ScholarHeader({ scholar }: ScholarHeaderProps) {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const totalHours = Math.round(scholar.totalDurationSeconds / 3600);
  const initial = scholar.name?.trim().charAt(0).toUpperCase() || "?";

  const bio = scholar.bio || "";
  const isLongBio = bio.length > 160;
  const displayBio = isLongBio && !isBioExpanded ? `${bio.substring(0, 160)}...` : bio;

  return (
    <div className={styles.root}>
      <div className={styles.headerTop}>
        {scholar.imageUrl ? (
          <Image
            src={scholar.imageUrl}
            alt={scholar.name}
            width={144}
            height={144}
            unoptimized
            className={styles.avatar}
          />
        ) : (
          <div
            className={styles.avatarFallback}
            role="img"
            aria-label={scholar.name}
          >
            {initial}
          </div>
        )}
        <div className={styles.headerInfo}>
          <h1 className={styles.name}>{scholar.name}</h1>
          {(scholar.country || scholar.mainLanguage) && (
            <p className={styles.meta}>
              {[scholar.country, scholar.mainLanguage].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {scholar.bio && (
        <div className={styles.bioContainer}>
          <p className={styles.bio}>{displayBio}</p>
          {isLongBio && (
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setIsBioExpanded(!isBioExpanded)}
            >
              {isBioExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

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
              <YoutubeIcon size={18} />
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
              <TwitterIcon size={18} />
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
