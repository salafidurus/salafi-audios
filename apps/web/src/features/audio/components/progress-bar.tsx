"use client";

import React from "react";

type ProgressBarProps = {
  progressPercent: number;
  onSeek?: (percent: number) => void;
};

export function ProgressBar({ progressPercent, onSeek }: ProgressBarProps) {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSeek) {
      onSeek(Number(e.target.value));
    }
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        padding: "4px 0",
      }}
    >
      <input
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={progressPercent || 0}
        onChange={handleSeek}
        aria-label="Audio progress"
        disabled={!onSeek}
        style={{
          width: "100%",
          height: 4,
          borderRadius: 2,
          outline: "none",
          cursor: onSeek ? "pointer" : "default",
          WebkitAppearance: "none",
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercent}%, #e2e8f0 ${progressPercent}%, #e2e8f0 100%)`,
          transition: "height 0.1s ease",
        }}
      />
    </div>
  );
}
