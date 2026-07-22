"use client";

import React from "react";
import { Play, Pause } from "lucide-react";
import type { ListingContentItemDto } from "@sd/core-contracts";
import { useAudio, useProgressStore, type Track } from "@sd/domain-audio";
import { audioService } from "@/features/audio";
import { List } from "@/shared/components/List";
import { AppText } from "@/shared/components/AppText/AppText";
import styles from "./ContentListItem.module.css";

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m} min`;
}

export type ContentListItemProps = {
  item: ListingContentItemDto;
  scholarName?: string;
  seriesId?: string;
  seriesTitle?: string;
  collectionId?: string;
  allTracksInContext?: Track[];
};

export function ContentListItem({
  item,
  scholarName = "",
  seriesId,
  seriesTitle,
  collectionId,
  allTracksInContext,
}: ContentListItemProps) {
  const { isPlaying, currentTrack } = useAudio();
  const progress = useProgressStore((s) => s.progressMap[item.id]);

  const isCurrentTrack = currentTrack?.id === item.id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const durationStr = formatDuration(
    item.durationSeconds || item.primaryAudioAsset?.durationSeconds,
  );
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
      title: item.title,
      artist: scholarName,
      url: item.primaryAudioAsset?.url ?? "",
      durationSeconds: item.durationSeconds || item.primaryAudioAsset?.durationSeconds || 0,
      seriesId: seriesId ?? null,
      seriesTitle: seriesTitle ?? null,
      collectionId: collectionId ?? null,
    };

    const queueContext =
      allTracksInContext && allTracksInContext.length > 0 ? allTracksInContext : [track];
    await audioService.playListing(track, queueContext);
  };

  return (
    <List.Item interactive onClick={() => void handlePlayClick()} className={styles.container}>
      <div className={styles.contentCol}>
        <div className={styles.titleRow}>
          <span className={styles.titleText}>
            <AppText variant="bodyLg" color="primary">
              {item.title}
            </AppText>
          </span>
        </div>

        {durationStr && (
          <div className={styles.metaRow}>
            <AppText variant="bodySm" color="muted">
              {durationStr}
            </AppText>
          </div>
        )}

        {progressPercent > 0 && !progress?.completedAt && (
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handlePlayClick}
        aria-label={isCurrentlyPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
        className={`${styles.playButton} ${isCurrentlyPlaying ? styles.playing : ""}`}
      >
        {isCurrentlyPlaying ? <Pause size={16} /> : <Play size={16} />}
        <span className={styles.playText}>{isCurrentlyPlaying ? "Pause" : "Play"}</span>
      </button>
    </List.Item>
  );
}
