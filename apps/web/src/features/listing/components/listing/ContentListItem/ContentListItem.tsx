"use client";

import type { ListingContentItemDto } from "@sd/core-contracts";

import { useAudio, useProgressStore, type Track } from "@sd/domain-audio";
import { Play, Pause, Check } from "lucide-react";
import React from "react";

import { audioService } from "@/features/audio";
import { List } from "@/shared/components/List";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";

import { contentItemAnchorId } from "../../../utils/content-item-anchor-id";
import styles from "./ContentListItem.module.css";

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m`;
}

export type ContentListItemProps = {
  item: ListingContentItemDto;
  scholarName?: string;
  scholarSlug?: string;
  seriesId?: string;
  seriesTitle?: string;
  moduleId?: string;
  moduleTitle?: string;
  collectionId?: string;
  allTracksInContext?: Track[];
  /** When this matches `item.id`, the row gets an anchor id and a brief highlight animation. */
  highlightItemId?: string;
};

export function ContentListItem({
  item,
  scholarName = "",
  scholarSlug,
  seriesId,
  seriesTitle,
  moduleId,
  moduleTitle,
  collectionId,
  allTracksInContext,
  highlightItemId,
}: ContentListItemProps) {
  const formattedScholarName = useFormattedScholarName(scholarName, scholarSlug);
  const { isPlaying, currentTrack } = useAudio();
  const progress = useProgressStore((s) => s.progressMap[item.id]);

  const isCurrentTrack = currentTrack?.id === item.id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const durationStr = formatDuration(
    item.durationSeconds || item.primaryAudioAsset?.durationSeconds,
  );
  const isCompleted = !!progress?.completedAt;
  const progressPercent =
    progress && progress.durationSeconds > 0
      ? Math.min(100, (progress.positionSeconds / progress.durationSeconds) * 100)
      : 0;

  const handlePlayClick = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (isCurrentTrack) {
      if (isPlaying) {
        await audioService.pause();
      } else {
        await audioService.resume();
      }
      return;
    }

    const track: Track = {
      id: item.id,
      slug: item.slug,
      title: item.title,
      artist: formattedScholarName,
      url: item.primaryAudioAsset?.url ?? "",
      durationSeconds: item.durationSeconds || item.primaryAudioAsset?.durationSeconds || 0,
      seriesId: seriesId ?? null,
      seriesTitle: seriesTitle ?? null,
      moduleId: moduleId ?? null,
      moduleTitle: moduleTitle ?? null,
      collectionId: collectionId ?? null,
    };

    const queueContext =
      allTracksInContext && allTracksInContext.length > 0 ? allTracksInContext : [track];
    await audioService.playListing(track, queueContext);
  };

  const isHighlighted = highlightItemId === item.id;

  return (
    <List.Item
      interactive
      onClick={() => void handlePlayClick()}
      id={contentItemAnchorId(item.id)}
      highlighted={isHighlighted}
      className={`${styles.container} ${isHighlighted ? styles.highlighted : ""}`}
    >
      <div className={styles.leftGroup}>
        {/* Status circle: checkmark if completed, otherwise empty circle */}
        <div className={`${styles.statusCircle} ${isCompleted ? styles.completedCircle : ""}`}>
          {isCompleted && <Check size={12} strokeWidth={3} />}
        </div>

        <div className={styles.titleGroup}>
          <p className={styles.itemTitle}>{item.title}</p>
          {durationStr && <p className={styles.itemDuration}>{durationStr}</p>}
          {progressPercent > 0 && !isCompleted && (
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handlePlayClick}
        aria-label={isCurrentlyPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
        className={styles.playCircleBtn}
      >
        {isCurrentlyPlaying ? (
          <Pause size={13} fill="var(--action-primary)" color="var(--action-primary)" />
        ) : (
          <Play
            size={13}
            fill="var(--action-primary)"
            color="var(--action-primary)"
            style={{ marginLeft: 1 }}
          />
        )}
      </button>
    </List.Item>
  );
}
