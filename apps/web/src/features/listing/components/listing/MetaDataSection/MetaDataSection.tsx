"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Disc } from "lucide-react";
import type { ListingDetailDto } from "@sd/core-contracts";
import { AppText } from "@/shared/components/AppText/AppText";
import { TopicChips } from "../topic-chips/topic-chips";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/settings/content-preference";
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
};

export function MetaDataSection({ listing }: MetaDataSectionProps) {
  const showOriginal = useShowOriginalContent();
  const title = pickContentField(listing.title, listing.original?.title, showOriginal);

  const imageUrl = listing.scholar.imageUrl;
  const durationStr = formatDuration(listing.durationSeconds);

  return (
    <div className={styles.container}>
      <div className={styles.artworkContainer}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.scholar.name}
            fill
            sizes="(max-width: 640px) 96px, 136px"
            unoptimized
            className={styles.artwork}
          />
        ) : (
          <div className={styles.artworkPlaceholder}>
            <Disc size={40} />
          </div>
        )}
      </div>

      <div className={styles.textColumn}>
        {/* Row 1: Title (Prominent Display Md) */}
        <AppText variant="displayMd" color="primary">
          {title}
        </AppText>

        {/* Row 2: Scholar Name Link (Primary strong color Title Md) */}
        <Link href={`/scholars/${listing.scholar.slug}`} className={styles.scholarLink}>
          {listing.scholar.imageUrl && (
            <Image
              src={listing.scholar.imageUrl}
              alt={listing.scholar.name}
              width={24}
              height={24}
              unoptimized
              className={styles.scholarAvatar}
            />
          )}
          <AppText variant="titleMd" color="primary">
            {listing.scholar.name}
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
        </div>
      </div>
    </div>
  );
}
