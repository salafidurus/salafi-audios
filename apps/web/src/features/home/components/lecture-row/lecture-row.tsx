import type { ScholarTitle } from "@sd/core-contracts";

import { useFormatScholarName } from "@sd/domain-content";
import { ChevronRight } from "lucide-react";

import { AppAvatar } from "@/shared/components/app-avatar";

import { SanadChain } from "../sanad-chain/sanad-chain";
import styles from "./lecture-row.module.css";

type LectureRowProps = {
  title: string;
  category: string;
  scholarName: string;
  scholarSlug?: string;
  scholarTitle?: ScholarTitle | string | null;
  scholarImageUrl?: string | null;
  listingArtwork?: string | null;
  duration: string;
  totalLessons: number;
  progress?: number;
  onClick?: () => void;
  className?: string;
};

export function LectureRow({
  title,
  category,
  scholarName,
  scholarTitle,
  scholarImageUrl,
  listingArtwork,
  duration,
  totalLessons,
  progress = 0,
  onClick,
  className,
}: LectureRowProps) {
  const formatScholarName = useFormatScholarName();
  const displayScholarName = formatScholarName({ name: scholarName, title: scholarTitle });
  const done = Math.round(progress * totalLessons);
  const t = totalLessons;

  const metaParts: string[] = [];
  if (category) metaParts.push(category);
  if (duration) metaParts.push(duration);
  if (t > 0) metaParts.push(`${t} ${t === 1 ? "lesson" : "lessons"}`);
  const metaText = metaParts.join(" · ");

  return (
    <div className={`${styles.row} ${className ?? ""}`}>
      <button type="button" onClick={onClick} className={styles.main}>
        <span className={styles.iconWrap}>
          <AppAvatar
            listingArtwork={listingArtwork}
            scholarImageUrl={scholarImageUrl}
            text={title}
            fill
          />
        </span>
        <span className={styles.info}>
          <span className={styles.title}>{title}</span>
          {displayScholarName ? <span className={styles.scholar}>{displayScholarName}</span> : null}
          {metaText ? <span className={styles.meta}>{metaText}</span> : null}
        </span>
        <span className={styles.chevron}>
          <ChevronRight size={16} color="var(--content-muted)" />
        </span>
      </button>
      {t > 1 ? (
        <span className={styles.progress}>
          <SanadChain total={t} completed={done} />
        </span>
      ) : null}
    </div>
  );
}
