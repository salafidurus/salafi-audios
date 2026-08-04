import { BookOpen, ChevronRight } from "lucide-react";

import { SanadChain } from "../sanad-chain/sanad-chain";
import styles from "./lecture-row.module.css";

type LectureRowProps = {
  title: string;
  category: string;
  scholarName: string;
  scholarSlug?: string;
  duration: string;
  totalLessons: number;
  progress?: number;
  onClick?: () => void;
  className?: string;
};

export function LectureRow({
  title,
  category,
  duration,
  totalLessons,
  progress = 0,
  onClick,
  className,
}: LectureRowProps) {
  const done = Math.round(progress * totalLessons);
  const t = totalLessons;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.row} ${className ?? ""}`}
      style={{
        background: "var(--surface-default)",
        border: "1px solid var(--border-default)",
      }}
    >
      <span className={styles.iconWrap}>
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
