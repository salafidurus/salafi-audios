"use client";

import type { ListingDetailDto } from "@sd/core-contracts";

import { pickContentField } from "@sd/core-i18n";
import Link from "next/link";
import React from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { AppAvatar } from "@/shared/components/app-avatar";
import { AppText } from "@/shared/components/AppText/AppText";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import { useFormatScholarName } from "@/shared/utils/format-scholar-name";

import { TopicChips } from "../topic-chips/topic-chips";
import styles from "./MetaDataSection.module.css";

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m} min`;
}

function formatLanguage(
  language: string | undefined,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  if (!language) return "";
  if (language === "ar") return t("common.arabic", "Arabic");
  if (language === "en") return t("common.english", "English");
  return language;
}

export type MetaDataSectionProps = {
  listing: ListingDetailDto;
  layout?: "inline" | "sidebar";
  moduleCount?: number;
};

type MetadataViewModel = {
  listing: ListingDetailDto;
  duration: string;
  language: string;
  hasLessonCount: boolean;
  moduleCount?: number;
};

type MetadataRowsProps = {
  metadata: MetadataViewModel;
  t: ReturnType<typeof useTranslation>["t"];
};

function MetadataRows({ metadata, t }: MetadataRowsProps) {
  return (
    <div className={styles.metaRow}>
      <TopicMetadata metadata={metadata} />
      <DurationMetadata metadata={metadata} />
      <LanguageMetadata metadata={metadata} />
      <LessonMetadata metadata={metadata} t={t} />
      <ModuleMetadata metadata={metadata} t={t} />
    </div>
  );
}

function Dot() {
  return <span className={styles.dot}>•</span>;
}

function TopicMetadata({ metadata }: { metadata: MetadataViewModel }) {
  if (metadata.listing.topics.length === 0) return null;
  const hasMeta = Boolean(
    metadata.duration ||
    metadata.language ||
    metadata.hasLessonCount ||
    metadata.moduleCount !== undefined,
  );
  return (
    <>
      <TopicChips topics={metadata.listing.topics} />
      {hasMeta && <Dot />}
    </>
  );
}

function DurationMetadata({ metadata }: { metadata: MetadataViewModel }) {
  return metadata.duration ? (
    <>
      <AppText variant="bodySm" color="muted">
        {metadata.duration}
      </AppText>
      {(metadata.language || metadata.hasLessonCount || metadata.moduleCount !== undefined) && (
        <Dot />
      )}
    </>
  ) : null;
}

function LanguageMetadata({ metadata }: { metadata: MetadataViewModel }) {
  return metadata.language ? (
    <>
      <AppText variant="bodySm" color="muted">
        {metadata.language}
      </AppText>
      {(metadata.hasLessonCount || metadata.moduleCount !== undefined) && <Dot />}
    </>
  ) : null;
}

function LessonMetadata({ metadata, t }: MetadataRowsProps) {
  return metadata.hasLessonCount ? (
    <>
      <Badge variant="outline">
        {metadata.listing.publishedLectureCount} {t("listing.lessons", "lessons")}
      </Badge>
      {metadata.moduleCount !== undefined && <Dot />}
    </>
  ) : null;
}

function ModuleMetadata({ metadata, t }: MetadataRowsProps) {
  return metadata.moduleCount !== undefined ? (
    <Badge variant="secondary">
      {metadata.moduleCount} {t("listing.modules", "modules")}
    </Badge>
  ) : null;
}

function MetaDataView({
  listing,
  layout,
  title,
  scholarTitle,
  scholarName,
  metadata,
  t,
}: {
  listing: MetaDataSectionProps["listing"];
  layout: MetaDataSectionProps["layout"];
  title: string;
  scholarTitle: string | undefined;
  scholarName: string;
  metadata: MetadataViewModel;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <div className={cn(styles.container, layout === "sidebar" && styles.sidebar)}>
      <div className={styles.artworkContainer}>
        <div className={styles.bookmarkRibbon} aria-hidden="true" />
        <AppAvatar
          listingArtwork={listing.coverImageUrl}
          name={listing.scholar.name}
          fill
          className={styles.artworkAvatar}
        />
      </div>
      <div className={styles.textColumn}>
        <h1 className={styles.titleText}>{title}</h1>
        <Link href={`/scholars/${listing.scholar.slug}`} className={styles.scholarLink}>
          <AppText variant="titleMd" color="primary">
            {scholarTitle && <span className={styles.scholarTitle}>{scholarTitle} </span>}
            {scholarName}
          </AppText>
        </Link>
        {listing.description && <p className={styles.description}>{listing.description}</p>}
        <MetadataRows metadata={metadata} t={t} />
      </div>
    </div>
  );
}

export function MetaDataSection({ listing, layout = "inline", moduleCount }: MetaDataSectionProps) {
  const { t } = useTranslation();
  const showOriginal = useShowOriginalContent();
  const formatScholarName = useFormatScholarName();
  const title = pickContentField(listing.title, listing.original?.title, showOriginal);

  const durationStr = formatDuration(listing.publishedDurationSeconds ?? listing.durationSeconds);
  const languageLabel = formatLanguage(listing.language, t);
  const hasLessonCount = listing.format !== "single" && listing.publishedLectureCount !== undefined;
  const scholarTitle = listing.scholar.title
    ? t(`scholar.title.${listing.scholar.title}`, listing.scholar.title)
    : undefined;
  const metadata: MetadataViewModel = {
    listing,
    duration: durationStr,
    language: languageLabel,
    hasLessonCount,
    moduleCount,
  };

  return (
    <MetaDataView
      listing={listing}
      layout={layout}
      title={title}
      scholarTitle={scholarTitle}
      scholarName={formatScholarName(listing.scholar.name)}
      metadata={metadata}
      t={t}
    />
  );
}
