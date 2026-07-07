"use client";

import Image from "next/image";
import type { ListingDetailDto } from "@sd/core-contracts";
import { AppText } from "@/shared/components/AppText/AppText";
import styles from "./lecture-meta.module.css";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export type LectureMetaProps = {
  lecture: ListingDetailDto;
};

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
        <AppText variant="bodySm" className={styles.mutedText}>
          {formatDate(lecture.publishedAt)}
        </AppText>
      )}

      {/* Duration */}
      {lecture.durationSeconds != null && (
        <AppText variant="bodySm" className={styles.mutedText}>
          {formatDuration(lecture.durationSeconds)}
        </AppText>
      )}

      {/* Language */}
      {lecture.language && (
        <AppText variant="bodySm" className={styles.mutedText}>
          {lecture.language}
        </AppText>
      )}
    </div>
  );
}
