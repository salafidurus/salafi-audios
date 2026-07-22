"use client";

import React from "react";
import type { ListingContentItemDto } from "@sd/core-contracts";
import type { Track } from "@sd/domain-audio";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { ContentListItem } from "../ContentListItem/ContentListItem";
import styles from "./ContentList.module.css";

export type ContentListProps = {
  items: ListingContentItemDto[];
  scholarName?: string;
  seriesId?: string;
  seriesTitle?: string;
};

export function ContentList({ items, scholarName = "", seriesId, seriesTitle }: ContentListProps) {
  // Construct all tracks in order for queue context
  const allTracksInContext: Track[] = items.map((item, i) => ({
    id: item.id,
    title: item.title,
    artist: scholarName,
    url: i === 0 ? (item.primaryAudioAsset?.url ?? "") : "",
    durationSeconds: item.durationSeconds || item.primaryAudioAsset?.durationSeconds || 0,
    seriesId: seriesId ?? null,
    seriesTitle: seriesTitle ?? null,
  }));

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
            seriesId={seriesId}
            seriesTitle={seriesTitle}
            allTracksInContext={allTracksInContext}
          />
        )}
      />
    </div>
  );
}
