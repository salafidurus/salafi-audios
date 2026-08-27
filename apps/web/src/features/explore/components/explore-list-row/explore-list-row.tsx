"use client";

import type { FeedContentItemDto } from "@sd/core-contracts";

import { pickContentField } from "@sd/core-i18n";
import {
  getProgressPercent,
  isListingFormat,
  isTrackActiveForListing,
  useAudio,
  useProgressStore,
} from "@sd/domain-audio";
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

type FeedRowModel = {
  item: FeedContentItemDto;
  title: string;
  scholarName: string;
  initial: string;
  durationText: string;
  publishedDateText: string;
  isMobile: boolean;
};

type FeedRowState = {
  isCurrentTrack: boolean;
  isPlaying: boolean;
  isSaved: boolean;
  isInProgress: boolean | undefined;
  progressPercent: number;
};

type FeedRowActions = {
  onPlay: (event: React.MouseEvent) => void;
  onSave: (event: React.MouseEvent) => void;
  onPress?: () => void;
};

type FeedListRowContentProps = {
  model: FeedRowModel;
  state: FeedRowState;
  actions: FeedRowActions;
};

function renderPlayButton(
  model: FeedRowModel,
  state: FeedRowState,
  onPlay: FeedRowActions["onPlay"],
) {
  const playing = state.isCurrentTrack && state.isPlaying;
  return (
    <Button
      variant="primary"
      size={!model.isMobile ? "icon" : "sm"}
      fullWidth={model.isMobile}
      aria-label={playing ? "Pause lecture" : "Play lecture"}
      icon={
        playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />
      }
      onClick={onPlay}
    >
      {model.isMobile && (playing ? "Pause" : "Play")}
    </Button>
  );
}

function renderSaveButton(
  model: FeedRowModel,
  state: FeedRowState,
  onSave: FeedRowActions["onSave"],
) {
  return (
    <Button
      variant={!model.isMobile ? "ghost" : "outline"}
      size={!model.isMobile ? "sm" : "icon"}
      fullWidth={model.isMobile}
      aria-label={state.isSaved ? "Remove from saved" : "Save lecture"}
      icon={<Bookmark size={16} fill={state.isSaved ? "currentColor" : "none"} />}
      onClick={onSave}
    >
      {model.isMobile && (state.isSaved ? "Saved" : "Save")}
    </Button>
  );
}

function playFeedItem(
  event: React.MouseEvent,
  isCurrentTrack: boolean,
  isPlaying: boolean,
  play: () => Promise<void>,
) {
  event.stopPropagation();
  if (isCurrentTrack) return isPlaying ? audioService.pause() : audioService.resume();
  return play();
}

function saveFeedItem(event: React.MouseEvent, item: FeedContentItemDto, isSaved: boolean) {
  event.stopPropagation();
  return isSaved ? markUnsaved(item.id, item.slug) : markSaved(item.id, item.slug);
}

function getFeedProgressState(
  progress:
    | { positionSeconds: number; durationSeconds: number; completedAt?: string | null }
    | undefined,
) {
  return {
    isInProgress: progress && progress.positionSeconds > 0 && !progress.completedAt,
    progressPercent: progress
      ? getProgressPercent(progress.positionSeconds, progress.durationSeconds)
      : 0,
  };
}

function getFeedInitial(scholarName: string) {
  return scholarName ? scholarName.trim().charAt(0).toUpperCase() : "?";
}

function FeedRowArtwork({
  item,
  scholarName,
  initial,
}: Pick<FeedRowModel, "item" | "scholarName" | "initial">) {
  return (
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
  );
}

function FeedRowActions({ model, state, actions }: FeedListRowContentProps) {
  return (
    <List.Item.Actions>
      {renderPlayButton(model, state, actions.onPlay)}
      {renderSaveButton(model, state, actions.onSave)}
    </List.Item.Actions>
  );
}

function FeedListRowContent({ model, state, actions }: FeedListRowContentProps) {
  const { item, title, scholarName, initial, durationText, publishedDateText } = model;
  const { isInProgress, progressPercent } = state;
  const { onPress } = actions;
  return (
    <List.Item interactive className={styles.row} onClick={onPress}>
      <div className={styles.container}>
        <FeedRowArtwork item={item} scholarName={scholarName} initial={initial} />
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
      <FeedRowActions model={model} state={state} actions={actions} />
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
    isListingFormat(item.kind) &&
    isTrackActiveForListing({ id: item.id, slug: item.slug, format: item.kind }, currentTrack);

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
  const { isInProgress, progressPercent } = getFeedProgressState(progress);

  const handlePlay = (event: React.MouseEvent) =>
    playFeedItem(event, isCurrentTrack, isPlaying, play);

  const handleSave = (event: React.MouseEvent) => saveFeedItem(event, item, isSaved);

  const initial = getFeedInitial(scholarName);

  const durationText = item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : "";

  const publishedDateFormatted = useFormattedDate(item.publishedAt || "", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const publishedDateText = item.publishedAt ? publishedDateFormatted : "";
  const model: FeedRowModel = {
    item,
    title,
    scholarName,
    initial,
    durationText,
    publishedDateText,
    isMobile,
  };
  const state: FeedRowState = {
    isCurrentTrack,
    isPlaying,
    isSaved,
    isInProgress,
    progressPercent,
  };
  const actions: FeedRowActions = { onPlay: handlePlay, onSave: handleSave, onPress };

  return <FeedListRowContent model={model} state={state} actions={actions} />;
}
