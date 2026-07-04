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
          cursor: onSeek ? "pointer" : "default",
          WebkitAppearance: "none",
          background: `linear-gradient(to right, var(--action-primary) 0%, var(--action-primary) ${progressPercent}%, var(--border-subtle) ${progressPercent}%, var(--border-subtle) 100%)`,
        }}
      />
    </div>
  );
}
