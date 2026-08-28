/** Documents this module's responsibility and public boundary. */
"use client";

import type { ListingDetailDto, ListingContentsDto } from "@sd/core-contracts";

import {
  isTrackActiveForListing,
  useAudio,
  useProgressStore,
  buildTrackQueue,
  type Track,
} from "@sd/domain-audio";
import { useLastPlayedLesson } from "@sd/domain-content";
import { Play, Pause, RotateCcw } from "lucide-react";
import React from "react";

import { useAuth } from "@/core/auth";
import { audioService } from "@/features/audio";
import { Button } from "@/shared/components/ui/button";
import { useFormatScholarName } from "@/shared/utils/format-scholar-name";

import { LectureSaveButton } from "../lecture-save-button/LectureSaveButton";
import styles from "./QuickButtonSection.module.css";

/** Documents the intent and contract of this declaration. */
export type QuickButtonSectionProps = {
  listing: ListingDetailDto;
  contents?: ListingContentsDto;
};

function hasListingProgress(
  isSingle: boolean,
  singleProgress: ReturnType<typeof useProgressStore.getState>["progressMap"][string] | undefined,
  lastPlayed: { positionSeconds: number; isCompleted: boolean } | null | undefined,
) {
  if (isSingle)
    return !!singleProgress && singleProgress.positionSeconds > 0 && !singleProgress.completedAt;
  return !!lastPlayed && lastPlayed.positionSeconds > 0 && !lastPlayed.isCompleted;
}

function buildListingTracks(
  listing: ListingDetailDto,
  contents: ListingContentsDto | undefined,
  formatScholarName: (scholar: ListingDetailDto["scholar"]) => string,
  startAtId?: string,
): Track[] {
  if (contents) {
    return buildTrackQueue(
      {
        id: listing.id,
        title: listing.title,
        format: listing.format,
        scholarName: formatScholarName(listing.scholar),
        scholarSlug: listing.scholar.slug,
        artworkUrl: listing.scholar.imageUrl,
      },
      contents,
      { startAtId },
    );
  }
  if (!listing.primaryAudioAsset) return [];
  return [
    {
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      artist: formatScholarName(listing.scholar),
      url: listing.primaryAudioAsset.url,
      durationSeconds: listing.durationSeconds || listing.primaryAudioAsset.durationSeconds || 0,
      artworkUrl: listing.scholar.imageUrl,
    },
  ];
}

async function toggleCurrentPlayback(isPlaying: boolean) {
  if (isPlaying) await audioService.pause();
  else await audioService.resume();
}

async function playFirstTrack(allTracks: Track[]) {
  const firstTrack = allTracks[0];
  if (firstTrack) await audioService.playListing(firstTrack, allTracks);
}

async function playResumeTrack(allTracks: Track[], resumeId: string | undefined) {
  if (allTracks.length === 0) return;
  const targetTrack = (resumeId && allTracks.find((t) => t.id === resumeId)) || allTracks[0];
  if (targetTrack) await audioService.playListing(targetTrack, allTracks);
}

/** Documents the intent and contract of this declaration. */
export function QuickButtonSection({ listing, contents }: QuickButtonSectionProps) {
  const formatScholarName = useFormatScholarName();
  const { isAuthenticated } = useAuth();
  const { isPlaying, currentTrack } = useAudio();
  const { data: lastPlayed } = useLastPlayedLesson(listing.slug, isAuthenticated);

  // Check progress: for single, check store directly; for series/collection, check lastPlayed or store
  const singleProgress = useProgressStore((s) => s.progressMap[listing.slug]);

  const isSingle = listing.format === "single";

  const hasProgress = hasListingProgress(isSingle, singleProgress, lastPlayed);

  // Check if currently playing:
  // single -> currentTrack.slug === listing.slug
  // series -> currentTrack.seriesId === listing.id
  // collection -> currentTrack.collectionId === listing.id
  const isCurrentActive = isTrackActiveForListing(listing, currentTrack);
  const isCurrentlyPlaying = isCurrentActive && isPlaying;

  // Builds the full ordered queue from contents, optionally starting eager
  // URL resolution at a specific track (e.g. resuming mid-series/collection).
  const getAllTracks = (startAtId?: string) =>
    buildListingTracks(listing, contents, formatScholarName, startAtId);

  const handlePlayPauseToggle = async () => {
    if (isCurrentActive) {
      await toggleCurrentPlayback(isPlaying);
      return;
    }
    await playFirstTrack(getAllTracks());
  };

  const handleContinuePlaying = async () => {
    if (isCurrentActive) {
      await toggleCurrentPlayback(isPlaying);
      return;
    }
    const resumeId = isSingle ? listing.slug : lastPlayed?.listingSlug;
    await playResumeTrack(getAllTracks(resumeId), resumeId);
  };

  const handlePlayFromStart = async () => {
    await playFirstTrack(getAllTracks());
  };

  // Main button label logic
  const playLabel = isSingle ? "Play" : "Play All";

  return (
    <div className={styles.container}>
      {hasProgress ? (
        <>
          {/* Continue Playing / Pause */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleContinuePlaying}
            className={styles.button}
          >
            {isCurrentlyPlaying ? (
              <>
                <Pause size={18} /> Pause
              </>
            ) : (
              <>
                <Play size={18} /> Continue Playing
              </>
            )}
          </Button>

          {/* Play from Start */}
          <Button
            variant="outline"
            size="lg"
            onClick={handlePlayFromStart}
            className={styles.button}
          >
            <RotateCcw size={16} /> Play from Start
          </Button>
        </>
      ) : (
        /* Single Play or Play All */
        <Button
          variant="primary"
          size="lg"
          onClick={handlePlayPauseToggle}
          className={styles.button}
        >
          {isCurrentlyPlaying ? (
            <>
              <Pause size={18} /> Pause
            </>
          ) : (
            <>
              <Play size={18} /> {playLabel}
            </>
          )}
        </Button>
      )}

      {/* Save Button */}
      <div className={styles.saveWrapper}>
        <LectureSaveButton lectureId={listing.id} lectureSlug={listing.slug} />
      </div>
    </div>
  );
}
