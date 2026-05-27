"use client";

import React from "react";
import { useAudio } from "@sd/domain-audio";
import { audioService } from "../index";
import { Play, Pause, RotateCw, RotateCcw } from "lucide-react";

export function PlaybackControls() {
  const { isPlaying, isLoading, speed, positionSeconds, durationSeconds, hasTrack } = useAudio();

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
    audioService.setSpeed(speeds[nextIndex]);
  };

  if (!hasTrack) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <button
        onClick={handleCycleSpeed}
        style={{
          padding: "4px 8px",
          borderRadius: 12,
          border: "none",
          backgroundColor: "#f1f5f9",
          color: "#475569",
          fontSize: 12,
          fontWeight: "bold",
          cursor: "pointer",
          minWidth: 50,
          textAlign: "center",
        }}
        title="Playback Speed"
      >
        {speed.toFixed(2)}x
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={handleSkipBackward}
          style={{
            background: "none",
            border: "none",
            color: "#475569",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
          aria-label="Skip backward 30 seconds"
        >
          <RotateCcw size={22} />
          <span style={{ fontSize: 8, fontWeight: "bold", position: "absolute", top: 8, color: "#475569" }}>30</span>
        </button>

        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            border: "none",
            backgroundColor: "#2563eb",
            color: "#fff",
            cursor: isLoading ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
            <span style={{ fontSize: 10 }}>…</span>
          ) : isPlaying ? (
            <Pause size={18} fill="#fff" />
          ) : (
            <Play size={18} fill="#fff" style={{ marginLeft: 2 }} />
          )}
        </button>

        <button
          onClick={handleSkipForward}
          style={{
            background: "none",
            border: "none",
            color: "#475569",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
          aria-label="Skip forward 30 seconds"
        >
          <RotateCw size={22} />
          <span style={{ fontSize: 8, fontWeight: "bold", position: "absolute", top: 8, color: "#475569" }}>30</span>
        </button>
      </div>
    </div>
  );
}
