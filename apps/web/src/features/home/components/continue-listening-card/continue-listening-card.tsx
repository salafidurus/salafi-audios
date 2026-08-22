"use client";

import type { RecentProgressDto } from "@sd/core-contracts";

import { routes } from "@sd/core-contracts";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { usePlayListing } from "@/features/audio";
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
        <div className={styles.sectionHeader}>
          <AppText variant="titleMd">
            <span data-testid="continue-listening-title">
              {t("search.continueListening", "Continue Listening")}
            </span>
          </AppText>
        </div>
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
  const { play, isLoading: isResumeLoading } = usePlayListing({
    id: recentProgress.lectureId,
    slug: recentProgress.lectureSlug,
    title: recentProgress.lectureTitle,
    format: recentProgress.format,
    scholarName,
    scholarSlug: recentProgress.scholarSlug,
    artworkUrl: recentProgress.artworkUrl,
  });

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
      <div className={styles.sectionHeader}>
        <AppText variant="titleMd">
          <span data-testid="continue-listening-title">
            {t("search.continueListening", "Continue Listening")}
          </span>
        </AppText>
        {progress !== null && (
          <span className={styles.percent}>
            {t("home.continue.complete", "{{percent}}% complete", { percent: progress })}
          </span>
        )}
      </div>
      <div data-testid="continue-listening-card" className={styles.continueCard}>
        <Link
          href={routes.listings.detail(recentProgress.lectureSlug)}
          className={styles.artworkLink}
          aria-label={`Open ${recentProgress.lectureTitle}`}
          onClick={() => onContinueListening?.(recentProgress.lectureSlug)}
        >
          <div className={styles.artwork}>
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
        </Link>

        <div className={styles.content}>
          <h3 className={styles.title} data-testid="continue-listening-lecture-title">
            <Link
              href={routes.listings.detail(recentProgress.lectureSlug)}
              onClick={() => onContinueListening?.(recentProgress.lectureSlug)}
            >
              {getResumeTitle(recentProgress)}
            </Link>
          </h3>
          {getResumeContext(recentProgress).map((contextLine) => (
            <p
              key={contextLine}
              className={styles.context}
              data-testid="continue-listening-context"
            >
              {contextLine}
            </p>
          ))}
          <p className={styles.scholar} data-testid="continue-listening-scholar-name">
            <Link href={routes.scholars.detail(recentProgress.scholarSlug)}>{scholarName}</Link>
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
          <button
            type="button"
            className={styles.resumeAction}
            onClick={() => void play()}
            disabled={isResumeLoading}
            aria-busy={isResumeLoading}
          >
            <Play size={14} fill="currentColor" aria-hidden="true" />
            {isResumeLoading ? "Starting…" : t("audio.resume", "Resume listening")}
          </button>
        </div>
      </div>
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

function getResumeContext(progress: RecentProgressDto): string[] {
  if (progress.format !== "single" || !progress.seriesContext) return [];

  if (progress.rootFormat === "collection" && progress.rootListing) {
    return [progress.rootListing.title];
  }

  return [];
}

function getResumeTitle(progress: RecentProgressDto): string {
  if (progress.format !== "single" || !progress.seriesContext) {
    return progress.lectureTitle;
  }

  return `${progress.lectureTitle} · ${progress.seriesContext.seriesTitle}`;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
