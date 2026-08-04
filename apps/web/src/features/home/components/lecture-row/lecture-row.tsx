import { BookOpen, ChevronRight } from "lucide-react";

import { SanadChain } from "../sanad-chain/sanad-chain";
import styles from "./lecture-row.module.css";

type LectureRowProps = {
  title: string;
  category: string;
  scholarName: string;
  scholarSlug?: string;
  duration: string;
  progress: number;
  totalLessons: number;
  onClick?: () => void;
};

export function LectureRow({
  title,
  category,
  duration,
  progress,
  totalLessons,
  onClick,
}: LectureRowProps) {
  const done = Math.round(progress * totalLessons);
  const t = totalLessons;

  return (
    <button
      type="button"
      onClick={onClick}
      className={styles.row}
      style={{
        background: "var(--surface-default)",
        border: "1px solid var(--border-default)",
      }}
    >
      <span
        className={styles.iconWrap}
        style={{
          background:
            "linear-gradient(135deg, var(--content-secondary), var(--border-primary-strong))",
          border: "1px solid color-mix(in srgb, var(--border-focus) 33%, transparent)",
        }}
      >
        <BookOpen size={17} color="var(--content-primary-strong)" />
      </span>
      <span className={styles.info}>
        <span className={styles.title}>{title}</span>
        <span className={styles.meta}>
          {category} &middot; {duration} &middot; {t} {t === 1 ? "lesson" : "lessons"}
        </span>
      </span>
      <span className={styles.progress}>
        <SanadChain total={t} completed={done} />
      </span>
      <span className={styles.chevron}>
        <ChevronRight size={16} color="var(--content-muted)" />
      </span>
    </button>
  );
}
