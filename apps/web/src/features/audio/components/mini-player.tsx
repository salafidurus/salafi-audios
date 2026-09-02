/** Keeps the active track playable while the user navigates between routes. */
"use client";

import { useAudio, useQueue } from "@sd/domain-audio";
import {
  BookOpen,
  Bookmark,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import React from "react";

import { useTranslation } from "@/core/i18n/use-translation";

import { audioService } from "../audio-service";
import styles from "./mini-player.module.css";
import { ProgressBar } from "./progress-bar";

/** Keeps the active track playable while the user navigates between routes. */
/** Route-persistent player surface for the active track, queue, seeking, and playback speed. */
function handleClose() {
  audioService.stop();
}

/** Keeps the active track playable from every route, including seek and queue navigation. */
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

  if (!hasTrack || !currentTrack) {
    return null;
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      audioService.pause();
    } else {
      audioService.resume();
    }
  };

  const handleSeek = (percent: number) => {
    if (durationSeconds > 0) {
      audioService.seek((percent / 100) * durationSeconds);
    }
  };

  const handleSkipBackward = () => {
    audioService.seek(Math.max(0, positionSeconds - 30));
  };

  const handleSkipForward = () => {
    audioService.seek(Math.min(durationSeconds, positionSeconds + 30));
  };

  const handleCycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    audioService.setSpeed(speeds[nextIndex]!);
  };

  return (
    <div className={styles.container}>
      {/* Left: Track Icon & Info */}
      <div className={styles.trackInfoGroup}>
        <div className={styles.coverBadge}>
          <BookOpen size={16} color="var(--content-primary-strong)" />
        </div>
        <div className={styles.trackCopy}>
          <p className={styles.title}>{currentTrack.title}</p>
          <p className={styles.artist}>{currentTrack.artist || "Salafi Durus"}</p>
        </div>
      </div>

      {/* Center: Controls & Scrubbing Bar */}
      <div className={styles.centerGroup}>
        <div className={styles.controlsRow}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleSkipBackward}
            aria-label={t("audio.skipBackward", "Skip backward 30 seconds")}
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => audioService.skipToPrevious()}
            aria-label={t("audio.previousTrack", "Previous track")}
          >
            <SkipBack size={16} />
          </button>
          <button
            type="button"
            className={styles.playPauseBtn}
            onClick={handlePlayPause}
            disabled={isLoading}
            aria-label={isPlaying ? t("audio.pause", "Pause") : t("audio.play", "Play")}
          >
            {isLoading ? (
              <span style={{ fontSize: 12 }}>…</span>
            ) : isPlaying ? (
              <Pause size={15} fill="currentColor" />
            ) : (
              <Play size={15} fill="currentColor" style={{ marginLeft: 1 }} />
            )}
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => audioService.skipToNext()}
            disabled={!hasNext}
            aria-label={t("audio.nextTrack", "Next track")}
          >
            <SkipForward size={16} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleSkipForward}
            aria-label={t("audio.skipForward", "Skip forward 30 seconds")}
          >
            <RotateCw size={15} />
          </button>
        </div>

        <div className={styles.scrubRow}>
          <span className={styles.timeLabel} style={{ textAlign: "right" }}>
            {formatTime(positionSeconds)}
          </span>
          <div style={{ flex: 1 }}>
            <ProgressBar progressPercent={progressPercent} onSeek={handleSeek} />
          </div>
          <span className={styles.timeLabel}>{formatTime(durationSeconds)}</span>
        </div>
      </div>

      {/* Right: Speed & Actions */}
      <div className={styles.rightGroup}>
        <button
          type="button"
          className={styles.speedBtn}
          onClick={handleCycleSpeed}
          title={t("audio.playbackSpeed", "Playback Speed")}
        >
          {speed.toFixed(2)}x
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label={t("audio.bookmark", "Bookmark")}
        >
          <Bookmark size={16} />
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={handleClose}
          aria-label={t("audio.close", "Close player")}
          title={t("audio.close", "Close player")}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return "0:00";
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
