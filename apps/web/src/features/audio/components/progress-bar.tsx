"use client";

import type { CSSProperties } from "react";

import React from "react";

import styles from "./progress-bar.module.css";

type ProgressBarProps = {
  progressPercent: number;
  onSeek?: (percent: number) => void;
};

type ProgressBarStyleVars = CSSProperties & {
  "--progress-percent": string;
};

export function ProgressBar({ progressPercent, onSeek }: ProgressBarProps) {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSeek) {
      onSeek(Number(e.target.value));
    }
  };

  return (
    <div className={styles.wrapper}>
      <input
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={progressPercent || 0}
        onChange={handleSeek}
        aria-label="Audio progress"
        disabled={!onSeek}
        className={`${styles.range} ${onSeek ? styles.rangeSeekable : styles.rangeDisabled}`}
        style={
          // SAFETY: React accepts CSS custom properties at runtime; this narrows the style
          // object to the single progress variable consumed by progress-bar.module.css.
          {
            "--progress-percent": `${progressPercent}%`,
          } as ProgressBarStyleVars
        }
      />
    </div>
  );
}
