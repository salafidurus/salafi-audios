import { BookOpen, Play } from "lucide-react";

import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";

import { SanadChain } from "../sanad-chain/sanad-chain";
import styles from "./featured-lecture-card.module.css";

type FeaturedLectureCardProps = {
  title: string;
  category: string;
  scholarName: string;
  scholarSlug?: string;
  duration: string;
  progress: number;
  totalLessons: number;
  onClick?: () => void;
  onPlay?: () => void;
};

export function FeaturedLectureCard({
  title,
  category,
  scholarName,
  scholarSlug,
  duration,
  progress,
  totalLessons,
  onClick,
  onPlay,
}: FeaturedLectureCardProps) {
  const displayScholar = useFormattedScholarName(scholarName, scholarSlug);
  const done = Math.round(progress * totalLessons);
  const t = totalLessons;

  return (
    <div
      role="region"
      aria-label={title}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
      className={styles.card}
      style={{
        background: "var(--surface-subtle)",
        border: "1px solid var(--border-default)",
      }}
    >
      <span className={styles.corner} aria-hidden="true" />
      <span
        className={styles.iconBox}
        style={{
          background: "var(--surface-default)",
          border: "1px solid var(--border-default)",
        }}
      >
        <BookOpen size={30} color="var(--action-primary)" strokeWidth={1.3} />
      </span>
      <span className={styles.body}>
        <span className={styles.topRow}>
          <span
            className={styles.catBadge}
            style={{
              color: "var(--content-secondary)",
              background: "color-mix(in srgb, var(--content-secondary) 12%, transparent)",
              border: "1px solid var(--border-secondary)",
            }}
          >
            {category.toUpperCase()}
          </span>
          <span className={styles.editorPick}>Editor&rsquo;s pick this week</span>
        </span>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.meta}>
          {displayScholar} &middot; {duration}
        </p>
        <span className={styles.bottomRow}>
          <SanadChain total={t} completed={done} />
          <span className={styles.lessonCount}>
            {t} {t === 1 ? "lesson" : "lessons"}
          </span>
        </span>
      </span>
      <button
        type="button"
        className={styles.playBtn}
        style={{ background: "var(--action-primary)" }}
        aria-label={`Play ${title}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onPlay) {
            onPlay();
          } else if (onClick) {
            onClick();
          }
        }}
      >
        <Play size={17} fill="currentColor" />
      </button>
    </div>
  );
}
