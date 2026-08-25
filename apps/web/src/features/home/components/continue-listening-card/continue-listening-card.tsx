"use client";

import type { RecentProgressDto } from "@sd/core-contracts";

import { routes } from "@sd/core-contracts";
import { Play } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { usePlayListing } from "@/features/audio";
import { AppAvatar } from "@/shared/components/app-avatar";
import { AppText } from "@/shared/components/AppText/AppText";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";
import { useResponsive } from "@/shared/hooks/use-responsive";

import styles from "./continue-listening-card.module.css";

export type ContinueListeningCardProps = {
  recentProgress?: RecentProgressDto | null;
  onContinueListening?: (lectureId: string) => void;
};

export function ContinueListeningCard({
  recentProgress,
  onContinueListening,
}: ContinueListeningCardProps) {
  const { isMobile } = useResponsive();

  if (!recentProgress) return null;

  return (
    <RichResumeCard
      recentProgress={recentProgress}
      onContinueListening={onContinueListening}
      isMobile={isMobile}
    />
  );
}

type RichResumeCardProps = {
  recentProgress: RecentProgressDto;
  onContinueListening?: (lectureId: string) => void;
  isMobile: boolean;
};

function RichResumeCard({ recentProgress, onContinueListening, isMobile }: RichResumeCardProps) {
  const { t } = useTranslation();
  const scholarName = useFormattedScholarName(
    recentProgress.scholarName,
    recentProgress.scholarSlug,
  );
  const progress = getProgress(recentProgress.positionSeconds, recentProgress.durationSeconds);
  const { play, isLoading: isResumeLoading } = usePlayListing({
    id: recentProgress.lectureId,
    slug: recentProgress.lectureSlug,
    title: recentProgress.lectureTitle,
    format: recentProgress.format,
    scholarName,
    scholarSlug: recentProgress.scholarSlug,
    artworkUrl: recentProgress.artworkUrl,
  });

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
        {!isMobile && (
          <Link
            href={routes.listings.detail(recentProgress.lectureSlug)}
            className={styles.artworkLink}
            aria-label={`Open ${recentProgress.lectureTitle}`}
            onClick={() => onContinueListening?.(recentProgress.lectureSlug)}
          >
            <div className={styles.artwork}>
              <AppAvatar
                listingArtwork={recentProgress.artworkUrl}
                scholarImageUrl={recentProgress.scholarImageUrl}
                text={scholarName}
                fill
                sizes="(max-width: 640px) 112px, 152px"
                className={recentProgress.artworkUrl ? styles.artworkImage : styles.scholarArtwork}
              />
            </div>
          </Link>
        )}

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
            <Progress
              value={progress ?? 0}
              className={styles.progressTrack}
              aria-label={t("audio.progress", "Listening progress")}
            />
            <div className={styles.timeRow}>
              <span data-testid="continue-listening-progress-text">
                {formatDuration(recentProgress.positionSeconds)}
              </span>
              <span>{formatDuration(recentProgress.durationSeconds)}</span>
            </div>
          </div>
          <Button
            type="button"
            className={styles.resumeAction}
            onClick={() => void play()}
            disabled={isResumeLoading}
            aria-busy={isResumeLoading}
            icon={<Play fill="currentColor" aria-hidden="true" />}
            size="lg"
            variant="primary"
            fullWidth={isMobile}
          >
            {isResumeLoading ? "Starting…" : t("audio.resume", "Resume listening")}
          </Button>
        </div>
      </div>
    </section>
  );
}

function getProgress(positionSeconds: number, durationSeconds: number): number | null {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return null;
  return Math.min(100, Math.max(0, Math.round((positionSeconds / durationSeconds) * 100)));
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
