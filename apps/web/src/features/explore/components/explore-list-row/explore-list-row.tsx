"use client";

import type { FeedContentItemDto } from "@sd/core-contracts";

import { pickContentField } from "@sd/core-i18n";
import { useAudio, useProgressStore } from "@sd/domain-audio";
import { useIsSaved, markSaved, markUnsaved } from "@sd/domain-content";
import { Play, Pause, Bookmark } from "lucide-react";
import Image from "next/image";
import React from "react";

import { useToast } from "@/core/toast";
import { audioService, usePlayListing } from "@/features/audio";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { List } from "@/shared/components/List";
import { MarqueeText } from "@/shared/components/MarqueeText";
import { Button } from "@/shared/components/ui/button";
import { useFormattedDate } from "@/shared/hooks/use-formatted-date";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";
import { useResponsive } from "@/shared/hooks/use-responsive";

import styles from "./explore-list-row.module.css";

export type FeedListRowProps = {
  item: FeedContentItemDto;
  onPress?: () => void;
};

export function FeedListRow({ item, onPress }: FeedListRowProps) {
  const showOriginal = useShowOriginalContent();
  const title = pickContentField(item.title, item.original?.title, showOriginal);
  const { isMobile } = useResponsive();
  const scholarName = useFormattedScholarName(item.scholarName, item.scholarSlug);
  const { addToast } = useToast();

  const { isPlaying, currentTrack } = useAudio();
  // A series/collection row is "current" whenever any of its own lessons is
  // playing, not just when the current track's slug equals this row's slug
  // (which only happens for a single).
  const isCurrentTrack =
    currentTrack?.slug === item.slug ||
    currentTrack?.seriesId === item.id ||
    currentTrack?.collectionId === item.id;

  const { play } = usePlayListing(
    {
      id: item.id,
      slug: item.slug,
      title,
      format: item.kind,
      scholarName,
      scholarSlug: item.scholarSlug,
      artworkUrl: item.thumbnailUrl ?? undefined,
    },
    { onError: (message) => addToast(message, "error") },
  );

  const isSaved = useIsSaved(item.id);

  const progress = useProgressStore((s) => s.progressMap[item.slug]);
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

    await play();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      markUnsaved(item.id, item.slug);
    } else {
      markSaved(item.id, item.slug);
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
          variant="primary"
          size={!isMobile ? "icon" : "sm"}
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
