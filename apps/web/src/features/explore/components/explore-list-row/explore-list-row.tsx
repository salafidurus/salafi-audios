"use client";

import React from "react";
import Image from "next/image";
import { Play, Pause, Bookmark } from "lucide-react";
import { useAudio, useProgressStore, type Track } from "@sd/domain-audio";
import type { FeedContentItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { List } from "@/shared/components/List";
import { Button } from "@/shared/components/Button";
import { MarqueeText } from "@/shared/components/MarqueeText";
import { useFormattedDate } from "@/shared/hooks/use-formatted-date";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";
import { audioService } from "@/features/audio";
import styles from "./explore-list-row.module.css";

export type FeedListRowProps = {
  item: FeedContentItemDto;
  onPress?: () => void;
};

export function FeedListRow({ item, onPress }: FeedListRowProps) {
  const showOriginal = useShowOriginalContent();
  const title = pickContentField(item.title, item.original?.title, showOriginal);
  const { isMobile } = useResponsive();
  const scholarName = useFormattedScholarName(item.scholarName);

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
      artist: scholarName,
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

  const initial = scholarName ? scholarName.trim().charAt(0).toUpperCase() : "?";

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
            <Image
              src={item.thumbnailUrl}
              alt={scholarName}
              fill
              sizes="(max-width: 640px) 20vw, 14vw"
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarFallback} aria-hidden="true">
              {initial}
            </div>
          )}
        </div>

        <div className={styles.centerSection}>
          <MarqueeText
            text={title}
            className="text-[var(--content-strong)] font-semibold [font-size:var(--typo-title-md-font-size)] xl:[font-size:var(--typo-title-lg-font-size)]"
          />
          <MarqueeText
            text={scholarName}
            className="text-[var(--content-muted)] font-normal [font-size:var(--typo-body-sm-font-size)] xl:[font-size:var(--typo-body-md-font-size)]"
          />
          <div className={styles.meta}>
            {durationText}
            {durationText && publishedDateText && " · "}
            {publishedDateText}
          </div>
        </div>
      </div>

      <List.Item.Actions>
        <Button
          variant={!isMobile ? "ghost" : "outline"}
          size={!isMobile ? "sm" : "icon"}
          fullWidth={isMobile}
          aria-label={isCurrentTrack && isPlaying ? "Pause lecture" : "Play lecture"}
          icon={
            isCurrentTrack && isPlaying ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" />
            )
          }
          onClick={handlePlay}
        >
          {isMobile && (isCurrentTrack && isPlaying ? "Pause" : "Play")}
        </Button>

        <Button
          variant={!isMobile ? "ghost" : "outline"}
          size={!isMobile ? "sm" : "icon"}
          fullWidth={isMobile}
          aria-label={isSaved ? "Remove from saved" : "Save lecture"}
          icon={<Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />}
          onClick={handleSave}
        >
          {isMobile && (isSaved ? "Saved" : "Save")}
        </Button>
      </List.Item.Actions>

      {isInProgress && (
        <div
          className={styles.progressBarContainer}
          aria-hidden="true"
          data-testid="progress-bar-container"
        >
          <div
            className={styles.progressBar}
            style={{ width: `${progressPercent}%` }}
            data-testid="progress-bar"
          />
        </div>
      )}
    </List.Item>
  );
}
