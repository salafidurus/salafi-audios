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

  const imageUrl = listing.scholar.imageUrl;
  const durationStr = formatDuration(listing.durationSeconds);

  return (
    <div className={cn(styles.container, layout === "sidebar" && styles.sidebar)}>
      <div className={styles.artworkContainer}>
        <div className={styles.bookmarkRibbon} aria-hidden="true" />
        <AppAvatar
          scholarImageUrl={imageUrl}
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
          <AppAvatar image={listing.scholar.imageUrl} name={listing.scholar.name} size={24} />
          <AppText variant="titleMd" color="primary">
            {formatScholarName(listing.scholar)}
          </AppText>
        </Link>

        {/* Row 3: Meta info (topics, duration, language) */}
        <div className={styles.metaRow}>
          {listing.topics.length > 0 && <TopicChips topics={listing.topics} />}

          {listing.topics.length > 0 && (durationStr || listing.language) && (
            <span className={styles.dot}>•</span>
          )}

          {durationStr && (
            <AppText variant="bodySm" color="muted">
              {durationStr}
            </AppText>
          )}

          {durationStr && listing.language && <span className={styles.dot}>•</span>}

          {listing.language && (
            <AppText variant="bodySm" color="muted">
              {listing.language}
            </AppText>
          )}

          {moduleCount !== undefined && (
            <Badge variant="secondary">
              {moduleCount} {t("listing.modules", "modules")}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
