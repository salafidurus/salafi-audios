"use client";

import React from "react";
import type { ListingDetailDto } from "@sd/core-contracts";
import { useAudio, type Track } from "@sd/domain-audio";
import { audioService } from "@/features/audio";
import { formatScholarName } from "@/shared/utils/format-scholar-name";
import { Button } from "@/shared/components/Button/Button";
import styles from "./LecturePlayButton.module.css";

export type LecturePlayButtonProps = {
  lecture: ListingDetailDto;
};

export function LecturePlayButton({ lecture }: LecturePlayButtonProps) {
  const { isPlaying, currentTrack } = useAudio();

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

    const track: Track = {
      id: lecture.id,
      title: lecture.title,
      artist: formatScholarName(lecture.scholar),
      url: asset.url,
      durationSeconds: asset.durationSeconds ?? lecture.durationSeconds ?? 0,
      artworkUrl: undefined,
      seriesId: lecture.seriesContext?.seriesId ?? null,
      seriesTitle: lecture.seriesContext?.seriesTitle ?? null,
    };

    const nextLecture = lecture.seriesContext?.nextLecture;
    const queueContext: Track[] = nextLecture
      ? [
          track,
          {
            id: nextLecture.id,
            title: nextLecture.title,
            artist: formatScholarName(lecture.scholar),
            url: "", // resolved lazily by DurusAudioService
            durationSeconds: 0,
            seriesId: lecture.seriesContext?.seriesId ?? null,
            seriesTitle: lecture.seriesContext?.seriesTitle ?? null,
          },
        ]
      : [track];

    await audioService.playListing(track, queueContext);
  };

  const label = isCurrentLecture && isPlaying ? "⏸ Pause Lecture" : "▶ Play Lecture";

  return (
    <Button variant="primary" size="lg" onClick={handlePlay} className={styles.button}>
      {label}
    </Button>
  );
}
