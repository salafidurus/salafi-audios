/** Documents this module's responsibility and public boundary. */
"use client";

import type { ListingContentItemDto } from "@sd/core-contracts";

import { useAudio, useProgressStore, type ListingProgress, type Track } from "@sd/domain-audio";
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

function StatusCircle({ completed }: { completed: boolean }) {
  return (
    <div className={`${styles.statusCircle} ${completed ? styles.completedCircle : ""}`}>
      {completed && <Check size={12} strokeWidth={3} />}
    </div>
  );
}

function ProgressIndicator({
  durationStr,
  progressPercent,
  completed,
}: {
  /** Documents the intent and contract of this field. */ durationStr: string;
  progressPercent: number;
  completed: boolean;
}) {
  return (
    <>
      {durationStr && <p className={styles.itemDuration}>{durationStr}</p>}
      {progressPercent > 0 && !completed && (
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
        </div>
      )}
    </>
  );
}

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <Pause size={13} fill="var(--action-primary)" color="var(--action-primary)" />
  ) : (
    <Play
      size={13}
      fill="var(--action-primary)"
      color="var(--action-primary)"
      style={{ marginLeft: 1 }}
    />
  );
}

function getProgressState(progress: ListingProgress | undefined) {
  const completed = !!progress?.completedAt;
  const progressPercent =
    progress && progress.durationSeconds > 0
      ? Math.min(100, (progress.positionSeconds / progress.durationSeconds) * 100)
      : 0;
  return { completed, progressPercent };
}

function nullableValue(value: string | undefined) {
  return value ?? null;
}

/** Documents the intent and contract of this declaration. */
export type ContentListItemProps = {
  item: ListingContentItemDto;
  scholarName?: string;
  /** Documents the intent and contract of this field. */ scholarSlug?: string;
  seriesId?: string;
  seriesTitle?: string;
  moduleId?: string;
  moduleTitle?: string;
  collectionId?: string;
  allTracksInContext?: Track[];
  /** When this matches `item.id`, the row gets an anchor id and a brief highlight animation. */
  highlightItemId?: string;
};

async function playContentItem(
  e: React.MouseEvent | undefined,
  isCurrentTrack: boolean,
  isPlaying: boolean,
  item: ListingContentItemDto,
  formattedScholarName: string,
  context: Pick<
    ContentListItemProps,
    "seriesId" | "seriesTitle" | "moduleId" | "moduleTitle" | "collectionId" | "allTracksInContext"
  >,
) {
  e?.stopPropagation();
  if (isCurrentTrack) {
    if (isPlaying) await audioService.pause();
    else await audioService.resume();
    return;
  }
  const track = createContentTrack(item, formattedScholarName, context);
  const queueContext = context.allTracksInContext?.length ? context.allTracksInContext : [track];
  await audioService.playListing(track, queueContext);
}

function ContentListItemView({
  item,
  isCompleted,
  durationStr,
  progressPercent,
  isCurrentlyPlaying,
  isHighlighted,
  onPlay,
}: {
  item: ListingContentItemDto;
  isCompleted: boolean;
  /** Documents the intent and contract of this field. */ durationStr: string;
  progressPercent: number;
  isCurrentlyPlaying: boolean;
  isHighlighted: boolean;
  onPlay: (event?: React.MouseEvent) => void;
}) {
  return (
    <List.Item
      interactive
      onClick={() => void onPlay()}
      id={contentItemAnchorId(item.id)}
      highlighted={isHighlighted}
      className={`${styles.container} ${isHighlighted ? styles.highlighted : ""}`}
    >
      <div className={styles.leftGroup}>
        <StatusCircle completed={isCompleted} />
        <div className={styles.titleGroup}>
          <p className={styles.itemTitle}>{item.title}</p>
          <ProgressIndicator
            durationStr={durationStr}
            progressPercent={progressPercent}
            completed={isCompleted}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onPlay}
        aria-label={isCurrentlyPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
        className={styles.playCircleBtn}
      >
        <PlayIcon playing={isCurrentlyPlaying} />
      </button>
    </List.Item>
  );
}

function createContentTrack(
  item: ListingContentItemDto,
  artist: string,
  context: Pick<
    ContentListItemProps,
    "seriesId" | "seriesTitle" | "moduleId" | "moduleTitle" | "collectionId"
  >,
): Track {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    artist,
    url: item.primaryAudioAsset?.url ?? "",
    durationSeconds: item.durationSeconds || item.primaryAudioAsset?.durationSeconds || 0,
    seriesId: nullableValue(context.seriesId),
    seriesTitle: nullableValue(context.seriesTitle),
    moduleId: nullableValue(context.moduleId),
    moduleTitle: nullableValue(context.moduleTitle),
    collectionId: nullableValue(context.collectionId),
  };
}

/** Documents the intent and contract of this declaration. */
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
  const progress = useProgressStore((s) => s.progressMap[item.slug]);

  const isCurrentTrack = currentTrack?.slug === item.slug;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const durationStr = formatDuration(
    item.durationSeconds || item.primaryAudioAsset?.durationSeconds,
  );
  const { completed: isCompleted, progressPercent } = getProgressState(progress);

  const handlePlayClick = (e?: React.MouseEvent) =>
    playContentItem(e, isCurrentTrack, isPlaying, item, formattedScholarName, {
      seriesId,
      seriesTitle,
      moduleId,
      moduleTitle,
      collectionId,
      allTracksInContext,
    });

  const isHighlighted = highlightItemId === item.id;

  return (
    <ContentListItemView
      item={item}
      isCompleted={isCompleted}
      durationStr={durationStr}
      progressPercent={progressPercent}
      isCurrentlyPlaying={isCurrentlyPlaying}
      isHighlighted={isHighlighted}
      onPlay={handlePlayClick}
    />
  );
}
