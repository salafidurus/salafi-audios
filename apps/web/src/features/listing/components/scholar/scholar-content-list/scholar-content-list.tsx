"use client";

import Image from "next/image";
import Link from "next/link";
import { FolderClosed, BookOpen, Play, ChevronLeft, ChevronRight } from "lucide-react";
import type { ScholarContentItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import { useIsRtl } from "@/shared/hooks/use-is-rtl";
import { useScholarTopics, useScholarContent } from "@sd/domain-content";
import styles from "./scholar-content-list.module.css";

export type ScholarContentListProps = {
  slug: string;
  searchQuery?: string;
  selectedTopicId?: string | null;
  scholarImageUrl?: string;
};

function contentHref(item: ScholarContentItemDto): string {
  return `/listings/${item.slug}`;
}

export function ContentRow({
  item,
  scholarImageUrl,
}: {
  item: ScholarContentItemDto;
  scholarImageUrl?: string;
}) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const isRtl = useIsRtl();

  const title = pickContentField(item.title, item.original?.title, showOriginal);
  const artworkUrl = item.coverImageUrl || item.scholarImageUrl || scholarImageUrl;

  const getMetadataText = () => {
    const parts: string[] = [];

    if (item.lectureCount != null && item.lectureCount > 0) {
      if (item.lectureCount === 1) {
        parts.push(t("scholarContent.statLectureSingular", "1 lecture"));
      } else {
        parts.push(
          t("scholarContent.statLecturesFormat", "{{count}} lectures", {
            count: item.lectureCount,
          }),
        );
      }
    }

    if (item.durationSeconds != null && item.durationSeconds > 0) {
      const hours = Math.floor(item.durationSeconds / 3600);
      const minutes = Math.round((item.durationSeconds % 3600) / 60);
      if (hours > 0) {
        parts.push(minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`);
      } else {
        parts.push(`${minutes}m`);
      }
    }

    return parts.join(" · ");
  };

  return (
    <Link href={contentHref(item)} className={`${styles.row} listRow`}>
      <div className={styles.iconSection}>
        {artworkUrl ? (
          <Image
            src={artworkUrl}
            alt=""
            width={48}
            height={48}
            unoptimized
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.fallbackIcon}>
            <Play size={20} fill="currentColor" />
          </div>
        )}
      </div>

      <div className={styles.centerSection}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.metadata}>{getMetadataText()}</span>
      </div>

      <div className={styles.rightSection}>
        {isRtl ? (
          <ChevronLeft size={20} className={styles.chevron} />
        ) : (
          <ChevronRight size={20} className={styles.chevron} />
        )}
      </div>
    </Link>
  );
}

export function ScholarContentList({
  slug,
  searchQuery = "",
  selectedTopicId = null,
  scholarImageUrl,
}: ScholarContentListProps) {
  const { t } = useTranslation();
  const { data: topicsData, isFetching: isTopicsFetching } = useScholarTopics(slug);
  const { data: flatContent, isFetching: isFlatFetching } = useScholarContent(slug);

  const query = searchQuery.trim().toLowerCase();

  if ((isTopicsFetching && !topicsData) || (isFlatFetching && !flatContent && !topicsData)) {
    return <p className={styles.empty}>{t("common.loading", "Loading…")}</p>;
  }

  const matchesQuery = (item: ScholarContentItemDto) => {
    if (!query) return true;
    const title = item.title.toLowerCase();
    const originalTitle = item.original?.title?.toLowerCase() ?? "";
    return title.includes(query) || originalTitle.includes(query);
  };

  // Determine items to display:
  // If a single topic filter chip is selected, retrieve items for that topic.
  // Otherwise, fallback to flat top-level content list.
  let rawItems: ScholarContentItemDto[] = [];
  if (selectedTopicId && topicsData?.topics) {
    const topic = topicsData.topics.find((t) => t.topicId === selectedTopicId);
    rawItems = topic?.items ?? [];
  } else {
    rawItems = flatContent?.items ?? [];
  }

  const filteredItems = rawItems.filter(matchesQuery);

  if (filteredItems.length === 0) {
    return (
      <p className={styles.empty}>{t("scholarContent.empty", "No published content found.")}</p>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.list}>
        {filteredItems.map((item) => (
          <ContentRow key={item.id} item={item} scholarImageUrl={scholarImageUrl} />
        ))}
      </div>
    </div>
  );
}
