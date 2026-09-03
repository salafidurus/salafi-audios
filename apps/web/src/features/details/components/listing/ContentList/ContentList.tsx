/** Lists a top-level listing's playable content and preserves its identity. */
"use client";

import type { ListingContentItemDto, ListingContentsDto } from "@sd/core-contracts";

import { buildTrackQueue, type Track } from "@sd/domain-audio";
import React from "react";

import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";

import { ContentListItem } from "../ContentListItem/ContentListItem";
import styles from "./ContentList.module.css";

/** Renders ordered listing content and supplies shared playback presentation context. */
export type ContentListProps = {
  items: ListingContentItemDto[];
  format: "single" | "series";
  scholarName?: string;
  /** Scholar identity used by playback metadata and progress association. */
  scholarSlug?: string;
  listingArtwork?: string;
  scholarImageUrl?: string;
  seriesId?: string;
  seriesTitle?: string;
  /** Item id to scroll to and briefly highlight on mount (e.g. a lesson linked via URL anchor). */
  highlightItemId?: string;
};

/** Displays a single or series content list while preserving full queue context. */
export function ContentList({
  items,
  format,
  scholarName = "",
  scholarSlug,
  listingArtwork,
  scholarImageUrl,
  seriesId,
  seriesTitle,
  highlightItemId,
}: ContentListProps) {
  const contents: ListingContentsDto =
    format === "series" ? { format: "series", items } : { format: "single", items };

  const allTracksInContext: Track[] = buildTrackQueue(
    {
      id: seriesId ?? "",
      title: seriesTitle ?? "",
      format,
      scholarName,
      scholarSlug,
      artworkUrl: listingArtwork,
      scholarImageUrl,
    },
    contents,
  );

  return (
    <div className={styles.container}>
      <InfiniteScrollList
        data={items}
        hasMore={false}
        onLoadMore={() => {}}
        renderItem={(item) => (
          <ContentListItem
            item={item}
            scholarName={scholarName}
            scholarSlug={scholarSlug}
            seriesId={seriesId}
            seriesTitle={seriesTitle}
            allTracksInContext={allTracksInContext}
            highlightItemId={highlightItemId}
          />
        )}
      />
    </div>
  );
}
