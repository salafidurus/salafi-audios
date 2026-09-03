/** Keeps the active track playable while the user navigates between routes. */
"use client";

import { useAudio, useQueue } from "@sd/domain-audio";
import { useIsSaved, markSaved, markUnsaved } from "@sd/domain-content";
import {
  BookOpen,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import React, { useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";

import { audioService } from "../audio-service";
import styles from "./mini-player.module.css";
import { ProgressBar } from "./progress-bar";

const SPEEDS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0] as const;

/** Route-persistent player surface for the active track, queue, seeking, and playback speed. */
export function MiniPlayer() {
  const {
    currentTrack,
    hasTrack,
    isPlaying,
    isLoading,
    speed,
    progressPercent,
    durationSeconds,
    positionSeconds,
  } = useAudio();
  const { hasNext } = useQueue();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const isSaved = useIsSaved(currentTrack?.id ?? "");

  if (!hasTrack || !currentTrack) return null;

  const playLabel = isPlaying ? t("audio.pause", "Pause") : t("audio.play", "Play");
  const handlePlayPause = () => togglePlayback(isPlaying);
  const handleSeek = (percent: number) => seekToPercent(percent, durationSeconds);
  const handleSkipBackward = () => audioService.seek(Math.max(0, positionSeconds - 30));
  const handleSkipForward = () =>
    audioService.seek(Math.min(durationSeconds, positionSeconds + 30));
  const handleCycleSpeed = () => {
    const currentIndex = SPEEDS.findIndex((value) => value === speed);
    audioService.setSpeed(SPEEDS[(currentIndex + 1) % SPEEDS.length]!);
  };
  const handleToggleSaved = () => {
    toggleSaved(isSaved, currentTrack.id, currentTrack.slug);
  };
  const sharedProps = {
    isPlaying,
    isLoading,
    hasNext,
    playLabel,
    onPlayPause: handlePlayPause,
    onSkipBackward: handleSkipBackward,
    onPrevious: () => audioService.skipToPrevious(),
    onNext: () => audioService.skipToNext(),
    onSkipForward: handleSkipForward,
  };
  const secondaryProps = {
    speed,
    isSaved,
    onCycleSpeed: handleCycleSpeed,
    onToggleSaved: handleToggleSaved,
    onClose: () => audioService.stop(),
    t,
  };

  return (
    <section className={styles.container} aria-label={t("audio.player", "Audio player")}>
      <div className={styles.desktopLayout}>
        <TrackIdentity track={currentTrack} />
        <div className={styles.centerGroup}>
          <TransportControls {...sharedProps} />
          <PlayerProgress
            positionSeconds={positionSeconds}
            durationSeconds={durationSeconds}
            progressPercent={progressPercent}
            onSeek={handleSeek}
          />
        </div>
        <SecondaryActions {...secondaryProps} />
      </div>

      <div className={styles.compactLayout}>
        <TrackIdentity track={currentTrack} />
        <div className={styles.compactControls}>
          <button
            type="button"
            className={styles.playPauseBtn}
            onClick={handlePlayPause}
            disabled={isLoading}
            aria-label={playLabel}
          >
            <PlayPauseIcon isPlaying={isPlaying} isLoading={isLoading} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setIsExpanded((expanded) => !expanded)}
            aria-expanded={isExpanded}
            aria-controls="mini-player-expanded"
            aria-label={getExpandLabel(isExpanded, t)}
          >
            <ExpandIcon isExpanded={isExpanded} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => audioService.stop()}
            aria-label={t("audio.close", "Close player")}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <CompactProgress progressPercent={progressPercent} />
      </div>

      <div
        id="mini-player-expanded"
        role="region"
        className={styles.expandedLayout}
        hidden={!isExpanded}
        aria-hidden={!isExpanded}
        aria-label={t("audio.expandedPlayer", "Expanded player")}
      >
        <PlayerProgress
          positionSeconds={positionSeconds}
          durationSeconds={durationSeconds}
          progressPercent={progressPercent}
          onSeek={handleSeek}
        />
        <TransportControls {...sharedProps} />
        <SecondaryActions {...secondaryProps} />
      </div>
    </section>
  );
}

type TrackIdentityProps = { track: NonNullable<ReturnType<typeof useAudio>["currentTrack"]> };

function TrackIdentity({ track }: TrackIdentityProps) {
  return (
    <div className={styles.trackInfoGroup}>
      <div className={styles.coverBadge}>
        {track.artworkUrl ? (
          <img className={styles.artwork} src={track.artworkUrl} alt={track.title} />
        ) : (
          <BookOpen aria-hidden="true" size={18} />
        )}
      </div>
      <div className={styles.trackCopy}>
        <p className={styles.title}>{track.title}</p>
        <p className={styles.artist}>{track.artist || "Salafi Durus"}</p>
      </div>
    </div>
  );
}

function togglePlayback(isPlaying: boolean) {
  if (isPlaying) audioService.pause();
  else audioService.resume();
}

function seekToPercent(percent: number, durationSeconds: number) {
  if (durationSeconds > 0) audioService.seek((percent / 100) * durationSeconds);
}

function toggleSaved(isSaved: boolean, id: string, slug: string) {
  if (isSaved) markUnsaved(id, slug);
  else markSaved(id, slug);
}

function getExpandLabel(isExpanded: boolean, t: (key: string, fallback: string) => string) {
  return isExpanded
    ? t("audio.collapsePlayer", "Collapse player")
    : t("audio.expandPlayer", "Expand player");
}

function ExpandIcon({ isExpanded }: { isExpanded: boolean }) {
  return isExpanded ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />;
}

type TransportControlsProps = {
  isPlaying: boolean;
  isLoading: boolean;
  hasNext: boolean;
  playLabel: string;
  onPlayPause: () => void;
  onSkipBackward: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSkipForward: () => void;
};

function TransportControls({
  isPlaying,
  isLoading,
  hasNext,
  playLabel,
  onPlayPause,
  onSkipBackward,
  onPrevious,
  onNext,
  onSkipForward,
}: TransportControlsProps) {
  return (
    <div className={styles.controlsRow}>
      <button
        type="button"
        className={styles.iconBtn}
        onClick={onSkipBackward}
        aria-label="Skip backward 30 seconds"
      >
        <RotateCcw aria-hidden="true" size={15} />
      </button>
      <button
        type="button"
        className={styles.iconBtn}
        onClick={onPrevious}
        aria-label="Previous track"
      >
        <SkipBack aria-hidden="true" size={16} />
      </button>
      <button
        type="button"
        className={styles.playPauseBtn}
        onClick={onPlayPause}
        disabled={isLoading}
        aria-label={playLabel}
      >
        <PlayPauseIcon isPlaying={isPlaying} isLoading={isLoading} />
      </button>
      <button
        type="button"
        className={styles.iconBtn}
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Next track"
      >
        <SkipForward aria-hidden="true" size={16} />
      </button>
      <button
        type="button"
        className={styles.iconBtn}
        onClick={onSkipForward}
        aria-label="Skip forward 30 seconds"
      >
        <RotateCw aria-hidden="true" size={15} />
      </button>
    </div>
  );
}

function PlayPauseIcon({
  isPlaying,
  isLoading,
}: Pick<TransportControlsProps, "isPlaying" | "isLoading">) {
  if (isLoading) return <span aria-hidden="true">…</span>;
  return isPlaying ? (
    <Pause aria-hidden="true" size={17} fill="currentColor" />
  ) : (
    <Play aria-hidden="true" size={17} fill="currentColor" />
  );
}

type PlayerProgressProps = {
  positionSeconds: number;
  /** Total track length used to calculate progress and clamp seek actions. */
  durationSeconds: number;
  progressPercent: number;
  onSeek: (percent: number) => void;
};

function PlayerProgress({
  positionSeconds,
  durationSeconds,
  progressPercent,
  onSeek,
}: PlayerProgressProps) {
  return (
    <div className={styles.scrubRow}>
      <span className={styles.timeLabel}>{formatTime(positionSeconds)}</span>
      <div className={styles.progressSlot}>
        <ProgressBar progressPercent={progressPercent} onSeek={onSeek} />
      </div>
      <span className={styles.timeLabel}>{formatTime(durationSeconds)}</span>
    </div>
  );
}

function CompactProgress({ progressPercent }: { progressPercent: number }) {
  return (
    <div
      className={styles.compactProgress}
      role="progressbar"
      aria-label="Audio progress"
      aria-valuenow={progressPercent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${progressPercent}%` }} />
    </div>
  );
}

type SecondaryActionsProps = {
  speed: number;
  isSaved: boolean;
  onCycleSpeed: () => void;
  onToggleSaved: () => void;
  onClose: () => void;
  t: (key: string, fallback: string) => string;
};

function SecondaryActions({
  speed,
  isSaved,
  onCycleSpeed,
  onToggleSaved,
  onClose,
  t,
}: SecondaryActionsProps) {
  return (
    <div className={styles.rightGroup}>
      <button
        type="button"
        className={styles.speedBtn}
        onClick={onCycleSpeed}
        aria-label={t("audio.playbackSpeed", "Playback Speed")}
      >
        {speed.toFixed(2)}x
      </button>
      <button
        type="button"
        className={styles.iconBtn}
        onClick={onToggleSaved}
        aria-label={isSaved ? "Remove from saved" : "Bookmark"}
        aria-pressed={isSaved}
      >
        <Bookmark aria-hidden="true" size={16} fill={isSaved ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        className={styles.iconBtn}
        onClick={onClose}
        aria-label={t("audio.close", "Close player")}
      >
        <X aria-hidden="true" size={16} />
      </button>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
