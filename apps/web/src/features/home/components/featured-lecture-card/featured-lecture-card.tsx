import type { ScholarTitle } from "@sd/core-contracts";

import { useFormatScholarName } from "@sd/domain-content";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";

import { SanadChain } from "../sanad-chain/sanad-chain";
import styles from "./featured-lecture-card.module.css";

type FeaturedLectureCardProps = {
  title: string;
  category: string;
  scholarName: string;
  scholarSlug?: string;
  scholarTitle?: ScholarTitle | string | null;
  duration: string;
  progress: number;
  totalLessons: number;
  eyebrow?: string;
  onClick?: () => void;
  onPlay?: () => void;
};

export function FeaturedLectureCard({
  title,
  category,
  scholarName,
  scholarSlug,
  scholarTitle,
  duration,
  progress,
  totalLessons,
  onClick,
  onPlay,
  eyebrow = "Editor’s pick this week",
}: FeaturedLectureCardProps) {
  const formatScholarName = useFormatScholarName();
  const formattedScholarFallback = useFormattedScholarName(scholarName, scholarSlug);
  const displayScholar = scholarTitle
    ? formatScholarName({ name: scholarName, title: scholarTitle })
    : formattedScholarFallback;
  const done = Math.round(progress * totalLessons);
  const t = totalLessons;

  return (
    <Card
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
      <CardContent className={styles.body}>
        <span className={styles.topRow}>
          <Badge
            variant="outline"
            className={styles.catBadge}
            style={{
              color: "var(--content-secondary)",
              background: "color-mix(in srgb, var(--content-secondary) 12%, transparent)",
              border: "1px solid var(--border-secondary)",
            }}
          >
            {category.toUpperCase()}
          </Badge>
          <span className={styles.editorPick}>{eyebrow}</span>
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
      </CardContent>
      <Button
        type="button"
        className={styles.playBtn}
        aria-label={`Play ${title}`}
        variant="primary"
        size="lg"
        onClick={(e) => {
          e.stopPropagation();
          if (onPlay) {
            onPlay();
          } else if (onClick) {
            onClick();
          }
        }}
      >
        Play
      </Button>
    </Card>
  );
}
