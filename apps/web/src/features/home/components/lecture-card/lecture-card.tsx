import { Pause, Play } from "lucide-react";
import React from "react";

import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";

import { SanadChain } from "../sanad-chain/sanad-chain";
import styles from "./lecture-card.module.css";

export type LectureCardProps = {
  title: string;
  category: string;
  scholarName: string;
  scholarSlug?: string;
  duration: string;
  progress?: number;
  totalLessons?: number;
  isPlaying?: boolean;
  onClick?: () => void;
  onPlay?: (e: React.MouseEvent) => void;
};

export function LectureCard({
  title,
  category,
  scholarName,
  scholarSlug,
  duration,
  progress = 0,
  totalLessons = 1,
  isPlaying = false,
  onClick,
  onPlay,
}: LectureCardProps) {
  const displayScholar = useFormattedScholarName(scholarName, scholarSlug);
  const lessons = totalLessons > 0 ? totalLessons : 1;
  const done = Math.round(progress * lessons);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(e);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className={styles.cardWrap}>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        className={styles.card}
      >
        <span className={styles.corner} aria-hidden="true" />
        <span className={styles.badge}>{category.toUpperCase()}</span>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.meta}>
          {displayScholar}
          {displayScholar && duration ? " · " : ""}
          {duration}
        </p>
        <div className={styles.footer}>
          <SanadChain total={lessons} completed={done} />
        </div>
      </div>
      <button
        type="button"
        onClick={handlePlayClick}
        className={styles.playBtn}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause size={14} fill="currentColor" />
        ) : (
          <Play size={14} fill="currentColor" />
        )}
      </button>
    </div>
  );
}
