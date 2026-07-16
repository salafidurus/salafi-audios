"use client";

import React from "react";
import Image from "next/image";
import { Play, Pause, Bookmark } from "lucide-react";
import { useAudio, useProgressStore, type Track } from "@sd/domain-audio";
import type { FeedContentItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { List } from "@/shared/components/List";
import { useFormattedDate } from "@/shared/hooks/use-formatted-date";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { audioService } from "@/features/audio";
import styles from "./feed-list-row.module.css";

export type FeedListRowProps = {
  item: FeedContentItemDto;
  onPress?: () => void;
};

export function FeedListRow({ item, onPress }: FeedListRowProps) {
  const showOriginal = useShowOriginalContent();
  const title = pickContentField(item.title, item.original?.title, showOriginal);

  const { isPlaying, currentTrack } = useAudio();
  const isCurrentTrack = currentTrack?.id === item.id;

  const isSaved = useProgressStore((s) => s.actions.isSaved(item.id));
  const addSaved = useProgressStore((s) => s.actions.addSaved);
  const removeSaved = useProgressStore((s) => s.actions.removeSaved);

  const progress = useProgressStore((s) => s.progressMap[item.id]);
  const isInProgress = progress && progress.positionSeconds > 0 && !progress.completedAt;

  const progressPercent =
    progress && progress.durationSeconds
      ? Math.min(Math.max((progress.positionSeconds / progress.durationSeconds) * 100, 0), 100)
      : 0;

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      title,
      artist: item.scholarName,
      url: "", // resolved lazily by DurusAudioService
      durationSeconds: item.durationSeconds ?? 0,
      artworkUrl: item.thumbnailUrl ?? undefined,
      seriesId: null,
      seriesTitle: null,
    };

    await audioService.playListing(track, [track]);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      removeSaved(item.id);
    } else {
      addSaved(item.id);
    }
  };

  const initial = item.scholarName ? item.scholarName.trim().charAt(0).toUpperCase() : "?";

  const durationText = item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : "";

  const publishedDateFormatted = useFormattedDate(item.publishedAt || "", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const publishedDateText = item.publishedAt ? publishedDateFormatted : "";

  return (
    <List.Item interactive className={styles.row} onClick={onPress}>
      <div className={styles.container}>
        <div className={styles.avatarSection}>
          {item.thumbnailUrl ? (
            <div className={styles.avatarContainer}>
              <Image
                src={item.thumbnailUrl}
                alt={item.scholarName}
                width={48}
                height={48}
                className={styles.avatarImage}
              />
            </div>
          ) : (
            <div className={styles.avatarFallback} aria-hidden="true">
              {initial}
            </div>
          )}
        </div>

        <div className={styles.centerSection}>
          <div className={styles.title}>{title}</div>
          <div className={styles.scholarName}>{item.scholarName}</div>
          <div className={styles.meta}>
            {durationText}
            {durationText && publishedDateText && " · "}
            {publishedDateText}
          </div>
        </div>

        <div className={styles.rightSection}>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.playButton} ${isCurrentTrack && isPlaying ? styles.playing : ""}`}
            onClick={handlePlay}
            aria-label={isCurrentTrack && isPlaying ? "Pause lecture" : "Play lecture"}
          >
            {isCurrentTrack && isPlaying ? (
              <Pause className={styles.playIcon} size={20} fill="currentColor" />
            ) : (
              <Play className={styles.playIcon} size={20} fill="currentColor" />
            )}
          </button>

          <button
            type="button"
            className={`${styles.actionButton} ${styles.saveButton} ${isSaved ? styles.saved : ""}`}
            onClick={handleSave}
            aria-label={isSaved ? "Remove from saved" : "Save lecture"}
          >
            <Bookmark
              className={styles.saveIcon}
              size={20}
              fill={isSaved ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>

      {isInProgress && (
        <div className={styles.progressBarContainer} aria-hidden="true">
          <div className={styles.progressBar} style={{ width: `${progressPercent}%` }} />
        </div>
      )}
    </List.Item>
  );
}
