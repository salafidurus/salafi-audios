"use client";

import { usePlayback } from "@sd/domain-playback";
import { ProgressBarWeb } from "../progress-bar/progress-bar.web";
import { PlaybackControlsWeb } from "../playback-controls/playback-controls.web";

export function MiniPlayerWeb() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    hasTrack,
    progressPercent,
    durationSeconds,
    positionSeconds,
    pause,
    resume,
    skipToNext,
    seek,
  } = usePlayback();

  if (!hasTrack || !currentTrack) return null;

  const handlePlayPause = () => {
    if (isPlaying) pause();
    else resume();
  };

  const handleSeek = (percent: number) => {
    seek((percent / 100) * durationSeconds);
  };

  return (
    <div
      style={{
        borderTop: "1px solid #e5e7eb",
        padding: "8px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        backgroundColor: "#fafafa",
      }}
    >
      <ProgressBarWeb progressPercent={progressPercent} onSeek={handleSeek} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentTrack.title}
          </p>
          {currentTrack.scholarName && (
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "#666",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {currentTrack.scholarName}
            </p>
          )}
        </div>
        <span style={{ fontSize: 12, color: "#999", whiteSpace: "nowrap" }}>
          {formatTime(positionSeconds)} / {formatTime(durationSeconds)}
        </span>
        <PlaybackControlsWeb
          isPlaying={isPlaying}
          isLoading={isLoading}
          onPlayPause={handlePlayPause}
          onSkipNext={skipToNext}
        />
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
