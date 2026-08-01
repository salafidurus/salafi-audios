"use client";

import type { ListingDetailDto } from "@sd/core-contracts";

import { useAudio, buildTrackQueue, type Track } from "@sd/domain-audio";
import { useListingContents } from "@sd/domain-content";
import React from "react";

import { audioService } from "@/features/audio";
import { Button } from "@/shared/components/Button/Button";
import { useFormatScholarName } from "@/shared/utils/format-scholar-name";

import styles from "./LecturePlayButton.module.css";

export type LecturePlayButtonProps = {
  lecture: ListingDetailDto;
};

export function LecturePlayButton({ lecture }: LecturePlayButtonProps) {
  const { isPlaying, currentTrack } = useAudio();
  const formatScholarName = useFormatScholarName();
  const { data: seriesContents } = useListingContents(lecture.seriesContext?.seriesId ?? "");

  if (!lecture.primaryAudioAsset) {
    return null;
  }

  const asset = lecture.primaryAudioAsset;
  const isCurrentLecture = currentTrack?.id === lecture.id;

  const handlePlay = async () => {
    if (isCurrentLecture) {
      if (isPlaying) {
        await audioService.pause();
      } else {
        await audioService.resume();
      }
      return;
    }

    const scholarName = formatScholarName(lecture.scholar);

    // When the immediate parent's contents have loaded, play the full ordered
    // queue for that Series/Module so Next/auto-advance continue through it —
    // not just a single lookahead track.
    if (lecture.seriesContext && seriesContents) {
      const queue = buildTrackQueue(
        {
          id: lecture.seriesContext.seriesId,
          title: lecture.seriesContext.seriesTitle,
          format: seriesContents.format,
          scholarName,
          scholarSlug: lecture.scholar.slug,
        },
        seriesContents,
        { startAtId: lecture.id },
      );
      const track = queue.find((t) => t.id === lecture.id);
      if (track) {
        await audioService.playListing(track, queue);
        return;
      }
    }

    const track: Track = {
      id: lecture.id,
      title: lecture.title,
      artist: scholarName,
      url: asset.url,
      durationSeconds: asset.durationSeconds ?? lecture.durationSeconds ?? 0,
      artworkUrl: undefined,
      seriesId: lecture.seriesContext?.seriesId ?? null,
      seriesTitle: lecture.seriesContext?.seriesTitle ?? null,
    };
    await audioService.playListing(track, [track]);
  };

  const label = isCurrentLecture && isPlaying ? "⏸ Pause Lecture" : "▶ Play Lecture";

  return (
    <Button variant="primary" size="lg" onClick={handlePlay} className={styles.button}>
      {label}
    </Button>
  );
}
