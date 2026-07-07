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
        <div className={styles.mutedText}>
          <AppText variant="bodySm">{formatDate(lecture.publishedAt)}</AppText>
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
