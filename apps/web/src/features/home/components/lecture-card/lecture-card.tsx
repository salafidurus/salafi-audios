import { Play } from "lucide-react";

import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";

import { SanadChain } from "../sanad-chain/sanad-chain";
import styles from "./lecture-card.module.css";

type LectureCardProps = {
  title: string;
  category: string;
  scholarName: string;
  scholarSlug?: string;
  duration: string;
  progress: number;
  totalLessons: number;
  onClick?: () => void;
};

export function LectureCard({
  title,
  category,
  scholarName,
  scholarSlug,
  duration,
  progress,
  totalLessons,
  onClick,
}: LectureCardProps) {
  const displayScholar = useFormattedScholarName(scholarName, scholarSlug);
  const done = Math.round(progress * totalLessons);

  return (
    <button
      type="button"
      onClick={onClick}
      className={styles.card}
      style={{ background: "var(--surface-default)", border: "1px solid var(--border-default)" }}
    >
      <span className={styles.corner} aria-hidden="true" />
      <span className={styles.badge}>{category.toUpperCase()}</span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.meta}>
        {displayScholar} &middot; {duration}
      </p>
      <span className={styles.footer}>
        <SanadChain total={totalLessons} completed={done} />
        <span className={styles.playBtn} aria-hidden="true">
          <Play size={14} fill="currentColor" />
        </span>
      </span>
    </button>
  );
}
