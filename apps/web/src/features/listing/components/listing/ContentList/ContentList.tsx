"use client";

import type { ListingContentItemDto, ListingContentsDto } from "@sd/core-contracts";

import { buildTrackQueue, type Track } from "@sd/domain-audio";
import React from "react";

import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";

import { ContentListItem } from "../ContentListItem/ContentListItem";
import styles from "./ContentList.module.css";

export type ContentListProps = {
  items: ListingContentItemDto[];
  format: "single" | "series";
  scholarName?: string;
  scholarSlug?: string;
  seriesId?: string;
  seriesTitle?: string;
};

export function ContentList({
  items,
  format,
  scholarName = "",
  scholarSlug,
  seriesId,
  seriesTitle,
}: ContentListProps) {
  const contents: ListingContentsDto =
    format === "series" ? { format: "series", items } : { format: "single", items };

  const allTracksInContext: Track[] = buildTrackQueue(
    { id: seriesId ?? "", title: seriesTitle ?? "", format, scholarName, scholarSlug },
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
          />
        )}
      />
    </div>
  );
}
