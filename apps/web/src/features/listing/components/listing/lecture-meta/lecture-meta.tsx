"use client";

import Image from "next/image";
import type { ListingDetailDto } from "@sd/core-contracts";
import { AppText } from "@/shared/components/AppText/AppText";
import { useFormattedDate } from "@/shared/hooks/use-formatted-date";
import styles from "./lecture-meta.module.css";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m} min`;
}

export type LectureMetaProps = {
  lecture: ListingDetailDto;
};

function PublishedDateContent({ publishedAt }: { publishedAt: string }) {
  const formatted = useFormattedDate(publishedAt, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return <AppText variant="bodySm">{formatted}</AppText>;
}

export function LectureMeta({ lecture }: LectureMetaProps) {
  return (
    <div className={styles.container}>
      {/* Scholar chip */}
      <div className={styles.scholarChip}>
        {lecture.scholar.imageUrl && (
          <Image
            src={lecture.scholar.imageUrl}
            alt={lecture.scholar.name}
            width={28}
            height={28}
            unoptimized
            className={styles.scholarImage}
          />
        )}
        <AppText variant="labelMd">{lecture.scholar.name}</AppText>
      </div>

      {/* Published date */}
      {lecture.publishedAt && (
        <div className={styles.mutedText}>
          <PublishedDateContent publishedAt={lecture.publishedAt} />
        </div>
      )}

      {/* Duration */}
      {lecture.durationSeconds != null && (
        <div className={styles.mutedText}>
          <AppText variant="bodySm">{formatDuration(lecture.durationSeconds)}</AppText>
        </div>
      )}

      {/* Language */}
      {lecture.language && (
        <div className={styles.mutedText}>
          <AppText variant="bodySm">{lecture.language}</AppText>
        </div>
      )}
    </div>
  );
}
