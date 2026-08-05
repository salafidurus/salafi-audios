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

  const metaParts: string[] = [];
  if (category) metaParts.push(category);
  if (duration) metaParts.push(duration);
  if (t > 0) metaParts.push(`${t} ${t === 1 ? "lesson" : "lessons"}`);
  const metaText = metaParts.join(" · ");

  return (
    <button type="button" onClick={onClick} className={`${styles.row} ${className ?? ""}`}>
      <span className={styles.iconWrap}>
        <BookOpen size={17} color="var(--action-primary)" strokeWidth={1.5} />
      </span>
      <span className={styles.info}>
        <span className={styles.title}>{title}</span>
        {metaText ? <span className={styles.meta}>{metaText}</span> : null}
      </span>
      {t > 1 ? (
        <span className={styles.progress}>
          <SanadChain total={t} completed={done} />
        </span>
      ) : null}
      <span className={styles.chevron}>
        <ChevronRight size={16} color="var(--content-muted)" />
      </span>
    </button>
  );
}
