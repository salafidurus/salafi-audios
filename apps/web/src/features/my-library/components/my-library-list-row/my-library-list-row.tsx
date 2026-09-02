/** Documents this module's responsibility and public boundary. */
"use client";

import { routes, type MyLibraryItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { getMyLibraryItemPercent } from "@sd/domain-content";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { useFormattedDate } from "@/shared/hooks/use-formatted-date";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";
import { useIsRtl } from "@/shared/hooks/use-is-rtl";

import styles from "./my-library-list-row.module.css";

/** Documents the intent and contract of this declaration. */
export type MyLibraryListRowProps = {
  item: MyLibraryItemDto;
  variant: "progress" | "saved" | "completed";
};

function statusLabelFor(
  variant: MyLibraryListRowProps["variant"],
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (variant === "progress") return t("myLibrary.status.progress", "In progress");
  if (variant === "saved") return t("myLibrary.status.saved", "Saved");
  return t("myLibrary.status.completed", "Completed");
}

function badgeVariantFor(variant: MyLibraryListRowProps["variant"]) {
  if (variant === "progress") return "default" as const;
  if (variant === "completed") return "secondary" as const;
  return "outline" as const;
}

function rightLabelFor(
  variant: MyLibraryListRowProps["variant"],
  progress: number | null,
  item: MyLibraryItemDto,
  savedAt: string,
  completedAt: string,
  t: ReturnType<typeof useTranslation>["t"],
) {
  const statusLabel = getStatusLabel(variant, progress, item, savedAt, completedAt, t);
  if (statusLabel) return statusLabel;
  if (item.durationSeconds)
    return t("lecture.minutes", "{{count}} min", { count: Math.round(item.durationSeconds / 60) });
  return "";
}

function getStatusLabel(
  variant: MyLibraryListRowProps["variant"],
  progress: number | null,
  item: MyLibraryItemDto,
  savedAt: string,
  completedAt: string,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (variant === "progress" && progress !== null)
    return t("myLibrary.percentListened", "{{percent}}% listened", { percent: progress });
  if (variant === "saved" && item.savedAt)
    return t("myLibrary.savedOn", "Saved {{date}}", { date: savedAt });
  if (variant === "completed" && item.completedAt)
    return t("myLibrary.completedOn", "Completed {{date}}", { date: completedAt });
  return null;
}

function seriesProgressFor(item: MyLibraryItemDto, t: ReturnType<typeof useTranslation>["t"]) {
  if (!item.totalLeafCount || item.totalLeafCount <= 0) return null;
  return t("myLibrary.seriesProgress", "{{completed}} of {{total}} lessons", {
    completed: item.completedLeafCount ?? 0,
    total: item.totalLeafCount,
  });
}

function renderProgress(
  variant: MyLibraryListRowProps["variant"],
  progress: number | null,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (variant !== "progress" || progress === null) return null;
  return (
    <Progress
      value={progress}
      className={styles.progressBar}
      aria-label={t("myLibrary.progressLabel", "{{percent}}% listened", { percent: progress })}
      data-testid="progress-bar"
    />
  );
}

function renderChevron(isRtl: boolean) {
  const Chevron = isRtl ? ChevronLeft : ChevronRight;
  return <Chevron className={styles.chevron} size={20} />;
}

/** Documents the intent and contract of this declaration. */
export function MyLibraryListRow({ item, variant }: MyLibraryListRowProps) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const isRtl = useIsRtl();
  const scholarName = useFormattedScholarName(item.scholarName, item.scholarSlug);

  const title = pickContentField(item.listingTitle, item.originalListingTitle, showOriginal);
  const initial = scholarName ? scholarName.trim().charAt(0).toUpperCase() : "?";

  const progress = getMyLibraryItemPercent(item);
  const statusLabel = statusLabelFor(variant, t);
  const seriesProgress = seriesProgressFor(item, t);

  const savedAtFormatted = useFormattedDate(item.savedAt || "", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const completedAtFormatted = useFormattedDate(item.completedAt || "", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const rightLabelText = rightLabelFor(
    variant,
    progress,
    item,
    savedAtFormatted,
    completedAtFormatted,
    t,
  );

  return (
    <Card size="sm" className={styles.card}>
      <CardContent className={styles.cardContent}>
        <Link
          href={routes.listings.detail(item.listingSlug)}
          className={`${styles.row} listRow`}
          aria-label={`${title} — ${statusLabel}`}
        >
          <div className={styles.avatarSection}>
            <Avatar size="lg" aria-hidden="true">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </div>

          <div className={styles.centerSection}>
            <div className={styles.title}>{title}</div>
            <div className={styles.metadata}>
              <span>
                {scholarName}
                {item.seriesTitle && ` · ${item.seriesTitle}`}
              </span>
              <Badge variant={badgeVariantFor(variant)}>{statusLabel}</Badge>
            </div>
            {seriesProgress && <div className={styles.seriesProgress}>{seriesProgress}</div>}
            {renderProgress(variant, progress, t)}
          </div>

          <div className={styles.rightSection}>
            {rightLabelText && (
              <span className={styles.caption} suppressHydrationWarning>
                {rightLabelText}
              </span>
            )}
            {renderChevron(isRtl)}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
