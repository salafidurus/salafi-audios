import { Pause, Play } from "lucide-react";
import React from "react";

import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";

import { SanadChain } from "../sanad-chain/sanad-chain";
import styles from "./lecture-card.module.css";

/** Documents this module's responsibility and public boundary. */
/** Display data and playback/navigation callbacks for a lecture card. */
export type LectureCardProps = {
  title: string;
  category: string;
  scholarName: string;
  /** Public scholar slug used to format the scholar identity consistently. */
  scholarSlug?: string;
  /** Already-formatted duration displayed beside the scholar name. */
  duration: string;
  progress?: number;
  totalLessons?: number;
  isPlaying?: boolean;
  onClick?: () => void;
  onPlay?: (e: React.MouseEvent) => void;
};

/** Renders lecture identity, progress, and a play action with keyboard support. */
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
        onKeyDown={(e) => handleCardKeyDown(e, onClick)}
        className={styles.card}
      >
        <span className={styles.corner} aria-hidden="true" />
        <span className={styles.badge}>{category.toUpperCase()}</span>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.meta}>{formatLectureMeta(displayScholar, duration)}</p>
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
        <PlayIcon isPlaying={isPlaying} />
      </button>
    </div>
  );
}

function handleCardKeyDown(event: React.KeyboardEvent<HTMLDivElement>, onClick?: () => void): void {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  onClick?.();
}

function formatLectureMeta(scholar: string, duration: string): string {
  return `${scholar}${scholar && duration ? " · " : ""}${duration}`;
}

function PlayIcon({ isPlaying }: { isPlaying: boolean }) {
  const Icon = isPlaying ? Pause : Play;
  return <Icon size={14} fill="currentColor" />;
}
