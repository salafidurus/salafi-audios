/** Starts a lecture or its containing series from the listing detail surface. */
"use client";

import type { ListingDetailDto } from "@sd/core-contracts";

import { useAudio, buildTrackQueue, type Track } from "@sd/domain-audio";
import { useListingContents } from "@sd/domain-content";
import React from "react";

import { audioService } from "@/features/audio";
import { Button } from "@/shared/components/ui/button";
import { useFormatScholarName } from "@/shared/utils/format-scholar-name";

import styles from "./LecturePlayButton.module.css";

/** Identifies the lecture whose audio should be started or resumed. */
export type LecturePlayButtonProps = {
  lecture: ListingDetailDto;
};

type SeriesContents = Awaited<ReturnType<typeof useListingContents>>["data"];

async function toggleCurrentLecture(isPlaying: boolean) {
  if (isPlaying) await audioService.pause();
  else await audioService.resume();
}

function resolveSeriesLecture(
  lecture: ListingDetailDto,
  scholarName: string,
  seriesContents: SeriesContents,
) {
  if (!lecture.seriesContext || !seriesContents) return null;

  const queue = buildTrackQueue(
    {
      id: lecture.seriesContext.seriesId,
      title: lecture.seriesContext.seriesTitle,
      format: seriesContents.format,
      scholarName,
      scholarSlug: lecture.scholar.slug,
      artworkUrl: lecture.coverImageUrl,
      scholarImageUrl: lecture.scholar.imageUrl,
    },
    seriesContents,
    { startAtId: lecture.id },
  );
  const track = queue.find((item) => item.id === lecture.id);
  if (!track) return null;

  return { queue, track };
}

function buildStandaloneTrack(
  lecture: ListingDetailDto,
  asset: NonNullable<ListingDetailDto["primaryAudioAsset"]>,
  scholarName: string,
): Track {
  return {
    id: lecture.id,
    slug: lecture.slug,
    title: lecture.title,
    artist: scholarName,
    url: asset.url,
    durationSeconds: asset.durationSeconds ?? lecture.durationSeconds ?? 0,
    artworkUrl: lecture.coverImageUrl,
    scholarImageUrl: lecture.scholar.imageUrl,
    seriesId: lecture.seriesContext?.seriesId ?? null,
    seriesTitle: lecture.seriesContext?.seriesTitle ?? null,
  };
}

async function playLecture(
  lecture: ListingDetailDto,
  asset: NonNullable<ListingDetailDto["primaryAudioAsset"]>,
  isCurrentLecture: boolean,
  isPlaying: boolean,
  scholarName: string,
  seriesContents: Awaited<ReturnType<typeof useListingContents>>["data"],
) {
  if (isCurrentLecture) {
    await toggleCurrentLecture(isPlaying);
    return;
  }

  const seriesLecture = resolveSeriesLecture(lecture, scholarName, seriesContents);
  if (seriesLecture) {
    await audioService.playListing(seriesLecture.track, seriesLecture.queue);
    return;
  }

  const track = buildStandaloneTrack(lecture, asset, scholarName);
  await audioService.playListing(track, [track]);
}

/** Renders the primary play action for a lecture listing. */
export function LecturePlayButton({ lecture }: LecturePlayButtonProps) {
  const { isPlaying, currentTrack } = useAudio();
  const formatScholarName = useFormatScholarName();
  const { data: seriesContents } = useListingContents(lecture.seriesContext?.seriesSlug ?? "");

  if (!lecture.primaryAudioAsset) {
    return null;
  }

  const asset = lecture.primaryAudioAsset;
  const isCurrentLecture = currentTrack?.slug === lecture.slug;

  const scholarName = formatScholarName(lecture.scholar);
  const handlePlay = () =>
    playLecture(lecture, asset, isCurrentLecture, isPlaying, scholarName, seriesContents);

  const label = isCurrentLecture && isPlaying ? "⏸ Pause Lecture" : "▶ Play Lecture";

  return (
    <Button variant="primary" size="lg" onClick={handlePlay} className={styles.button}>
      {label}
    </Button>
  );
}
