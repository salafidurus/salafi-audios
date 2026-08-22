"use client";

import type { RecentProgressDto } from "@sd/core-contracts";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components/AppText/AppText";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";

import styles from "./continue-listening-card.module.css";

export type ContinueListeningCardProps = {
  recentProgress?: RecentProgressDto | null;
  isLoading?: boolean;
  onContinueListening?: (lectureId: string) => void;
};

export function ContinueListeningCard({
  recentProgress,
  isLoading = false,
  onContinueListening,
}: ContinueListeningCardProps) {
  const { t } = useTranslation();

  if (isLoading && !recentProgress) {
    return (
      <section
        className={styles.continueSection}
        aria-label={t("audio.resumePlayback", "Resume playback")}
        data-testid="continue-listening-section"
      >
        <AppText variant="titleMd">
          <span data-testid="continue-listening-title">
            {t("search.continueListening", "Continue Listening")}
          </span>
        </AppText>
        <div className={styles.loadingCard} data-testid="continue-listening-skeleton">
          <div className={`${styles.skeleton} ${styles.skeletonArtwork}`} />
          <div className={styles.skeletonContent}>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeleton} ${styles.skeletonMeta}`} />
            <div className={`${styles.skeleton} ${styles.skeletonProgress}`} />
          </div>
        </div>
      </section>
    );
  }

  if (!recentProgress) return null;

  return (
    <RichResumeCard recentProgress={recentProgress} onContinueListening={onContinueListening} />
  );
}

type RichResumeCardProps = {
  recentProgress: RecentProgressDto;
  onContinueListening?: (lectureId: string) => void;
};

function RichResumeCard({ recentProgress, onContinueListening }: RichResumeCardProps) {
  const { t } = useTranslation();
  const scholarName = useFormattedScholarName(
    recentProgress.scholarName,
    recentProgress.scholarSlug,
  );
  const [artworkStage, setArtworkStage] = useState<"listing" | "scholar" | "fallback">(
    recentProgress.artworkUrl ? "listing" : recentProgress.scholarImageUrl ? "scholar" : "fallback",
  );
  const progress = getProgress(recentProgress.positionSeconds, recentProgress.durationSeconds);
  const initials = getInitials(scholarName);

  const handleArtworkError = () => {
    setArtworkStage((stage) => {
      if (stage === "listing" && recentProgress.scholarImageUrl) return "scholar";
      return "fallback";
    });
  };

  return (
    <section
      className={styles.continueSection}
      aria-label={t("audio.resumePlayback", "Resume playback")}
      data-testid="continue-listening-section"
    >
      <AppText variant="titleMd">
        <span data-testid="continue-listening-title">
          {t("search.continueListening", "Continue Listening")}
        </span>
      </AppText>
      <button
        type="button"
        data-testid="continue-listening-card"
        onClick={() => onContinueListening?.(recentProgress.lectureSlug)}
        className={styles.continueCard}
        aria-label={`${t("audio.resumePlayback", "Resume playback")}: ${recentProgress.lectureTitle}`}
      >
        <div className={styles.artwork} aria-hidden="true">
          {artworkStage === "listing" && recentProgress.artworkUrl ? (
            <Image
              src={recentProgress.artworkUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 112px, 152px"
              unoptimized
              className={styles.artworkImage}
              onError={handleArtworkError}
            />
          ) : artworkStage === "scholar" && recentProgress.scholarImageUrl ? (
            <Avatar className={styles.scholarArtwork}>
              <AvatarImage
                src={recentProgress.scholarImageUrl}
                alt=""
                onError={handleArtworkError}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className={styles.scholarArtwork}>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.contentHeader}>
            {progress !== null && (
              <span className={styles.percent}>
                {t("home.continue.complete", "{{percent}}% complete", { percent: progress })}
              </span>
            )}
          </div>
          <h3 className={styles.title} data-testid="continue-listening-lecture-title">
            {recentProgress.lectureTitle}
          </h3>
          <p className={styles.context} data-testid="continue-listening-context">
            {getResumeContext(recentProgress)}
          </p>
          <p className={styles.scholar} data-testid="continue-listening-scholar-name">
            {scholarName}
          </p>
          <div className={styles.progressBlock}>
            <div className={styles.progressTrack} aria-hidden="true">
              <div className={styles.progressFill} style={{ width: `${progress ?? 0}%` }} />
            </div>
            <div className={styles.timeRow}>
              <span data-testid="continue-listening-progress-text">
                {formatDuration(recentProgress.positionSeconds)}
              </span>
              <span>{formatDuration(recentProgress.durationSeconds)}</span>
            </div>
          </div>
          <span className={styles.resumeAction}>
            <Play size={14} fill="currentColor" aria-hidden="true" />
            {t("audio.resume", "Resume listening")}
          </span>
        </div>
      </button>
    </section>
  );
}

function getProgress(positionSeconds: number, durationSeconds: number): number | null {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return null;
  return Math.min(100, Math.max(0, Math.round((positionSeconds / durationSeconds) * 100)));
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (
    words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function getResumeContext(progress: RecentProgressDto): string {
  if (progress.format === "collection") {
    return formatContainerContext("Collection", progress.publishedLectureCount);
  }
  if (progress.format === "series") {
    return formatContainerContext("Series", progress.publishedLectureCount);
  }

  const lessonNumber = progress.orderIndex
    ? `Lesson ${String(progress.orderIndex).padStart(2, "0")}`
    : "Lesson";
  const parentTitle = progress.seriesContext?.seriesTitle;
  const rootTitle =
    progress.rootFormat === "collection" && progress.rootListing
      ? progress.rootListing.title
      : null;

  return [lessonNumber, parentTitle, rootTitle].filter(Boolean).join(" · ");
}

function formatContainerContext(label: string, lessonCount?: number): string {
  if (!lessonCount || lessonCount < 1) return label;
  return `${label} · ${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}`;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
