"use client";

import React from "react";
import { useAudio } from "@sd/domain-audio";
import { audioService } from "../index";
import { ProgressBar } from "./progress-bar";
import { PlaybackControls } from "./playback-controls";
import styles from "./mini-player.module.css";

export function MiniPlayer() {
  const { currentTrack, hasTrack, progressPercent, durationSeconds, positionSeconds } = useAudio();

  if (!hasTrack || !currentTrack) return null;

  const handleSeek = (percent: number) => {
    if (durationSeconds > 0) {
      audioService.seek((percent / 100) * durationSeconds);
    }
  };

  return (
    <div className={styles.container}>
      <ProgressBar progressPercent={progressPercent} onSeek={handleSeek} />

      <div className={styles.innerRow}>
        <div className={styles.trackInfo}>
          <p className={styles.title}>{currentTrack.title}</p>
          {currentTrack.artist && <p className={styles.artist}>{currentTrack.artist}</p>}
        </div>

        <div className={styles.controlsWrap}>
          <span className={styles.time}>
            {formatTime(positionSeconds)} / {formatTime(durationSeconds)}
          </span>

          <PlaybackControls />
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
