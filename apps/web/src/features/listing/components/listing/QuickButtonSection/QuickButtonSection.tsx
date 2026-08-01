"use client";

import type { ListingDetailDto, ListingContentsDto } from "@sd/core-contracts";

import { useAudio, useProgressStore, buildTrackQueue, type Track } from "@sd/domain-audio";
import { useLastPlayedLesson } from "@sd/domain-content";
import { Play, Pause, RotateCcw } from "lucide-react";
import React from "react";

import { useAuth } from "@/core/auth";
import { audioService } from "@/features/audio";
import { Button } from "@/shared/components/Button/Button";
import { useFormatScholarName } from "@/shared/utils/format-scholar-name";

import { LectureSaveButton } from "../lecture-save-button/LectureSaveButton";
import styles from "./QuickButtonSection.module.css";

export type QuickButtonSectionProps = {
  listing: ListingDetailDto;
  contents?: ListingContentsDto;
};

export function QuickButtonSection({ listing, contents }: QuickButtonSectionProps) {
  const formatScholarName = useFormatScholarName();
  const { isAuthenticated } = useAuth();
  const { isPlaying, currentTrack } = useAudio();
  const { data: lastPlayed } = useLastPlayedLesson(listing.id, isAuthenticated);

  // Check progress: for single, check store directly; for series/collection, check lastPlayed or store
  const singleProgress = useProgressStore((s) => s.progressMap[listing.id]);

  const isSingle = listing.format === "single";

  const hasProgress = isSingle
    ? !!singleProgress && singleProgress.positionSeconds > 0 && !singleProgress.completedAt
    : !!lastPlayed && lastPlayed.positionSeconds > 0 && !lastPlayed.isCompleted;

  // Check if currently playing:
  // single -> currentTrack.id === listing.id
  // series -> currentTrack.seriesId === listing.id
  // collection -> currentTrack.collectionId === listing.id
  const isCurrentlyPlaying = isSingle
    ? currentTrack?.id === listing.id && isPlaying
    : listing.format === "series"
      ? currentTrack?.seriesId === listing.id && isPlaying
      : currentTrack?.collectionId === listing.id && isPlaying;

  const isCurrentActive = isSingle
    ? currentTrack?.id === listing.id
    : listing.format === "series"
      ? currentTrack?.seriesId === listing.id
      : currentTrack?.collectionId === listing.id;

  // Builds the full ordered queue from contents, optionally starting eager
  // URL resolution at a specific track (e.g. resuming mid-series/collection).
  const getAllTracks = (startAtId?: string): Track[] => {
    if (!contents) {
      if (listing.primaryAudioAsset) {
        return [
          {
            id: listing.id,
            title: listing.title,
            artist: formatScholarName(listing.scholar),
            url: listing.primaryAudioAsset.url,
            durationSeconds:
              listing.durationSeconds || listing.primaryAudioAsset.durationSeconds || 0,
            artworkUrl: listing.scholar.imageUrl,
          },
        ];
      }
      return [];
    }

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
  };

  const handlePlayPauseToggle = async () => {
    if (isCurrentActive) {
      if (isPlaying) {
        await audioService.pause();
      } else {
        await audioService.resume();
      }
      return;
    }

    const allTracks = getAllTracks();
    const firstTrack = allTracks[0];
    if (!firstTrack) return;

    // Start playing from first track
    await audioService.playListing(firstTrack, allTracks);
  };

  const handleContinuePlaying = async () => {
    if (isCurrentActive) {
      if (isPlaying) {
        await audioService.pause();
      } else {
        await audioService.resume();
      }
      return;
    }

    // Find the track to resume, and build the queue starting eager URL
    // resolution there instead of always at the first track.
    const resumeId = isSingle ? listing.id : lastPlayed?.listingId;
    const allTracks = getAllTracks(resumeId);
    if (allTracks.length === 0) return;

    const targetTrack = (resumeId && allTracks.find((t) => t.id === resumeId)) || allTracks[0];
    if (!targetTrack) return;
    await audioService.playListing(targetTrack, allTracks);
  };

  const handlePlayFromStart = async () => {
    const allTracks = getAllTracks();
    const firstTrack = allTracks[0];
    if (!firstTrack) return;
    await audioService.playListing(firstTrack, allTracks);
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
        <LectureSaveButton lectureId={listing.id} />
      </div>
    </div>
  );
}
