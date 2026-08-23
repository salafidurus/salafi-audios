"use client";

import type { ListingDetailDto } from "@sd/core-contracts";

import { pickContentField } from "@sd/core-i18n";
import Link from "next/link";
import React from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { AppAvatar } from "@/shared/components/app-avatar";
import { AppText } from "@/shared/components/AppText/AppText";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import { useFormatScholarName } from "@/shared/utils/format-scholar-name";

import { TopicChips } from "../topic-chips/topic-chips";
import styles from "./MetaDataSection.module.css";

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m} min`;
}

export type MetaDataSectionProps = {
  listing: ListingDetailDto;
  layout?: "inline" | "sidebar";
  moduleCount?: number;
};

export function MetaDataSection({ listing, layout = "inline", moduleCount }: MetaDataSectionProps) {
  const { t } = useTranslation();
  const showOriginal = useShowOriginalContent();
  const formatScholarName = useFormatScholarName();
  const title = pickContentField(listing.title, listing.original?.title, showOriginal);

  const durationStr = formatDuration(listing.publishedDurationSeconds ?? listing.durationSeconds);
  const languageLabel =
    listing.language === "ar"
      ? t("common.arabic", "Arabic")
      : listing.language === "en"
        ? t("common.english", "English")
        : listing.language;
  const hasModuleCount = moduleCount !== undefined;
  const hasLessonCount = listing.format !== "single" && listing.publishedLectureCount !== undefined;
  const hasMeta = Boolean(durationStr || languageLabel || hasLessonCount || hasModuleCount);
  const scholarTitle = listing.scholar.title
    ? t(`scholar.title.${listing.scholar.title}`, listing.scholar.title)
    : undefined;

  return (
    <div className={cn(styles.container, layout === "sidebar" && styles.sidebar)}>
      <div className={styles.artworkContainer}>
        <div className={styles.bookmarkRibbon} aria-hidden="true" />
        <AppAvatar
          listingArtwork={listing.coverImageUrl}
          name={listing.scholar.name}
          fill
          className={styles.artworkAvatar}
        />
      </div>

      <div className={styles.textColumn}>
        {/* Row 1: Title in Fraunces display font */}
        <h1 className={styles.titleText}>{title}</h1>

        {/* Row 2: Scholar Name Link (Primary strong color Title Md) */}
        <Link href={`/scholars/${listing.scholar.slug}`} className={styles.scholarLink}>
          <AppText variant="titleMd" color="primary">
            {scholarTitle && <span className={styles.scholarTitle}>{scholarTitle} </span>}
            {formatScholarName(listing.scholar.name)}
          </AppText>
        </Link>

        {listing.description && <p className={styles.description}>{listing.description}</p>}

        {/* Row 3: Meta info (topics, duration, language) */}
        <div className={styles.metaRow}>
          {listing.topics.length > 0 && <TopicChips topics={listing.topics} />}

          {listing.topics.length > 0 && hasMeta && <span className={styles.dot}>•</span>}

          {durationStr && (
            <AppText variant="bodySm" color="muted">
              {durationStr}
            </AppText>
          )}

          {durationStr && (languageLabel || hasLessonCount || hasModuleCount) && (
            <span className={styles.dot}>•</span>
          )}

          {languageLabel && (
            <AppText variant="bodySm" color="muted">
              {languageLabel}
            </AppText>
          )}

          {languageLabel && (hasLessonCount || hasModuleCount) && (
            <span className={styles.dot}>•</span>
          )}

          {hasLessonCount && (
            <Badge variant="outline">
              {listing.publishedLectureCount} {t("listing.lessons", "lessons")}
            </Badge>
          )}

          {hasLessonCount && hasModuleCount && <span className={styles.dot}>•</span>}

          {hasModuleCount && (
            <Badge variant="secondary">
              {moduleCount} {t("listing.modules", "modules")}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
