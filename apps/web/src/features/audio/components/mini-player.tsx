"use client";

import React from "react";
import type { CSSProperties } from "react";
import { useAudio } from "@sd/domain-audio";
import { audioService } from "../index";
import { ProgressBar } from "./progress-bar";
import { PlaybackControls } from "./playback-controls";

const containerStyle: CSSProperties = {
  position: "sticky",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 50,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  borderTop: "1px solid rgba(226, 232, 240, 0.8)",
  padding: "12px 24px",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  boxShadow: "0 -10px 15px -3px rgba(0, 0, 0, 0.05), 0 -4px 6px -2px rgba(0, 0, 0, 0.02)",
};

const innerRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  width: "100%",
};

const trackInfoStyle: CSSProperties = { flex: 1, minWidth: 0 };

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 600,
  color: "#1e293b",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const artistStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: "#64748b",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  marginTop: 2,
};

const controlsWrapStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
};

const timeStyle: CSSProperties = {
  fontSize: 12,
  color: "#64748b",
  fontFamily: "monospace",
  whiteSpace: "nowrap",
};

export function MiniPlayer() {
  const { currentTrack, hasTrack, progressPercent, durationSeconds, positionSeconds } = useAudio();

  if (!hasTrack || !currentTrack) return null;

  const handleSeek = (percent: number) => {
    if (durationSeconds > 0) {
      audioService.seek((percent / 100) * durationSeconds);
    }
  };

  return (
    <div style={containerStyle}>
      <ProgressBar progressPercent={progressPercent} onSeek={handleSeek} />

      <div style={innerRowStyle}>
        <div style={trackInfoStyle}>
          <p style={titleStyle}>{currentTrack.title}</p>
          {currentTrack.artist && <p style={artistStyle}>{currentTrack.artist}</p>}
        </div>

        <div style={controlsWrapStyle}>
          <span style={timeStyle}>
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
