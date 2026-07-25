"use client";

import React from "react";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./listing-modal.module.css";

interface AudioData {
  audioKey: string;
  durationSeconds: number;
  sizeBytes: number;
  format: string;
  filename: string;
}

interface ListingUploadArrangeReviewSectionProps {
  listingTitle?: string;
  audioData: AudioData | null;
  currentAudioKey?: string;
}

export function ListingUploadArrangeReviewSection({
  listingTitle,
  audioData,
  currentAudioKey,
}: ListingUploadArrangeReviewSectionProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {t("admin.contents.listing.reviewAudioHeading", "Audio & Arrangement Review")}
      </h3>
      {listingTitle && (
        <div className={styles.reviewGroup}>
          <span className={styles.reviewLabel}>
            {t("admin.contents.listing.title", "Listing Title")}
          </span>
          <span className={styles.reviewValue}>{listingTitle}</span>
        </div>
      )}
      <div className={styles.reviewGroup}>
        <span className={styles.reviewLabel}>
          {t("admin.contents.listing.audioFile", "Audio File")}
        </span>
        <span className={styles.reviewValue}>
          {audioData ? audioData.filename : currentAudioKey || t("common.none", "None")}
        </span>
      </div>
      {audioData && (
        <>
          <div className={styles.reviewGroup}>
            <span className={styles.reviewLabel}>
              {t("admin.contents.listing.duration", "Duration")}
            </span>
            <span className={styles.reviewValue}>{Math.round(audioData.durationSeconds)}s</span>
          </div>
          <div className={styles.reviewGroup}>
            <span className={styles.reviewLabel}>
              {t("admin.contents.listing.fileSize", "File Size")}
            </span>
            <span className={styles.reviewValue}>
              {(audioData.sizeBytes / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
        </>
      )}
      <div className={styles.reviewGroup}>
        <span className={styles.reviewLabel}>
          {t("admin.contents.listing.arrangeStatus", "Arrangement")}
        </span>
        <span className={styles.reviewValue}>
          {t("admin.contents.listing.defaultArrangement", "Standard Single Audio")}
        </span>
      </div>
    </div>
  );
}
