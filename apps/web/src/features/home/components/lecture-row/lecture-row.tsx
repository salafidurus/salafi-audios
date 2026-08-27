import type { ScholarTitle } from "@sd/core-contracts";

import { useFormatScholarName } from "@sd/domain-content";
import { ChevronRight } from "lucide-react";

import { AppAvatar } from "@/shared/components/app-avatar";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";

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

function buildLectureMeta(category: string, duration: string, totalLessons: number): string {
  return [
    category,
    duration,
    totalLessons > 0 ? `${totalLessons} ${totalLessons === 1 ? "lesson" : "lessons"}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function LectureProgress({ total, completed }: { total: number; completed: number }) {
  if (total <= 1) return null;
  return (
    <span className={styles.progress}>
      <SanadChain total={total} completed={completed} />
    </span>
  );
}

export function LectureRow({
  title,
  category,
  scholarName,
  scholarSlug,
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
  const formattedScholarFallback = useFormattedScholarName(scholarName, scholarSlug);
  const displayScholarName = scholarTitle
    ? formatScholarName({ name: scholarName, title: scholarTitle })
    : formattedScholarFallback;
  const done = Math.round(progress * totalLessons);
  const t = totalLessons;

  const metaText = buildLectureMeta(category, duration, t);

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
      <LectureProgress total={t} completed={done} />
    </div>
  );
}
