"use client";

import React, { type CSSProperties } from "react";
import { useAudio } from "@sd/domain-audio";
import { audioService } from "../index";
import { Play, Pause, RotateCw, RotateCcw } from "lucide-react";
import { useTranslation } from "@/core/i18n/use-translation";

const outerStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 16 };

const speedButtonStyle: CSSProperties = {
  padding: "4px 8px",
  borderRadius: 12,
  border: "none",
  backgroundColor: "var(--surface-subtle)",
  color: "var(--content-muted)",
  fontSize: 12,
  fontWeight: "bold",
  cursor: "pointer",
  minWidth: 50,
  textAlign: "center",
};

const controlsGroupStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 12 };

const skipButtonStyle: CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--content-muted)",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
};

const skipLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: "bold",
  position: "absolute",
  top: 8,
  color: "var(--content-muted)",
};

export function PlaybackControls() {
  const { isPlaying, isLoading, speed, positionSeconds, durationSeconds, hasTrack } = useAudio();
  const { t } = useTranslation();

  const handlePlayPause = () => {
    if (isPlaying) {
      audioService.pause();
    } else {
      audioService.resume();
    }
  };

  const handleSkipForward = () => {
    const target = Math.min(positionSeconds + 30, durationSeconds);
    audioService.seek(target);
  };

  const handleSkipBackward = () => {
    const target = Math.max(positionSeconds - 30, 0);
    audioService.seek(target);
  };

  const handleCycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    audioService.setSpeed(speeds[nextIndex]!);
  };

  if (!hasTrack) {
    return null;
  }
  const playButtonStyle: CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 20,
    border: "none",
    backgroundColor: "var(--action-primary)",
    color: "var(--content-on-primary)",
    cursor: isLoading ? "wait" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "var(--shadow-sm)",
  };

  return (
    <div style={outerStyle}>
      <button
        type="button"
        onClick={handleCycleSpeed}
        style={speedButtonStyle}
        title={t("audio.playbackSpeed", "Playback Speed")}
      >
        {speed.toFixed(2)}x
      </button>

      <div style={controlsGroupStyle}>
        <button
          type="button"
          onClick={handleSkipBackward}
          style={skipButtonStyle}
          aria-label={t("audio.skipBackward", "Skip backward 30 seconds")}
        >
          <RotateCcw size={22} />
          <span style={skipLabelStyle}>30</span>
        </button>

        <button
          type="button"
          onClick={handlePlayPause}
          disabled={isLoading}
          style={playButtonStyle}
          aria-label={isPlaying ? t("audio.pause", "Pause") : t("audio.play", "Play")}
        >
          {isLoading ? (
            <span style={{ fontSize: 12 }}>…</span>
          ) : isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />
          )}
        </button>

        <button
          type="button"
          onClick={handleSkipForward}
          style={skipButtonStyle}
          aria-label={t("audio.skipForward", "Skip forward 30 seconds")}
        >
          <RotateCw size={22} />
          <span style={skipLabelStyle}>30</span>
        </button>
      </div>
    </div>
  );
}
