/** Documents this module's responsibility and public boundary. */
"use client";

import {
  ScholarContentUnifiedDtoSchema,
  ScholarTopicsDtoSchema,
  type ScholarContentItemDto,
  type ScholarContentUnifiedDto,
  type ScholarTopicsDto,
} from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useScholarTopics, useScholarContent } from "@sd/domain-content";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useIsRtl } from "@/shared/hooks/use-is-rtl";

import styles from "./scholar-content-list.module.css";

/** Documents the intent and contract of this declaration. */
export type ScholarContentListProps = {
  /** Documents the intent and contract of this field. */ slug: string;
  searchQuery?: string;
  selectedTopicId?: string | null;
  scholarImageUrl?: string;
};

type ScholarTopicsData = ScholarTopicsDto | undefined;
type ScholarContentData = ScholarContentUnifiedDto | undefined;

function contentHref(item: ScholarContentItemDto): string {
  return `/listings/${item.slug}`;
}

function shouldShowLoading(
  isTopicsFetching: boolean,
  topicsData: ScholarTopicsData,
  isFlatFetching: boolean,
  flatContent: ScholarContentData,
) {
  return (isTopicsFetching && !topicsData) || (isFlatFetching && !flatContent && !topicsData);
}

function selectScholarItems(
  selectedTopicId: string | null,
  topicsData: ScholarTopicsData,
  flatContent: ScholarContentData,
) {
  const parsedTopics = ScholarTopicsDtoSchema.safeParse(topicsData);
  const parsedContent = ScholarContentUnifiedDtoSchema.safeParse(flatContent);
  if (selectedTopicId && parsedTopics.success) {
    return parsedTopics.data.topics.find((topic) => topic.topicId === selectedTopicId)?.items ?? [];
  }
  return parsedContent.success ? parsedContent.data.items : [];
}

function formatLectureCount(
  item: ScholarContentItemDto,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  if (item.lectureCount == null || item.lectureCount <= 0) return "";
  if (item.lectureCount === 1) return t("scholarContent.statLectureSingular", "1 lecture");
  return t("scholarContent.statLecturesFormat", "{{count}} lectures", {
    count: item.lectureCount,
  });
}

function formatDuration(item: ScholarContentItemDto): string {
  if (item.durationSeconds == null || item.durationSeconds <= 0) return "";
  const hours = Math.floor(item.durationSeconds / 3600);
  const minutes = Math.round((item.durationSeconds % 3600) / 60);
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${minutes}m`;
}

function formatMetadataText(
  item: ScholarContentItemDto,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  const parts = [formatLectureCount(item, t), formatDuration(item)].filter(Boolean);
  return parts.join(" · ");
}

/** Documents the intent and contract of this declaration. */
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
        <span className={styles.metadata}>{formatMetadataText(item, t)}</span>
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

/** Documents the intent and contract of this declaration. */
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

  if (shouldShowLoading(isTopicsFetching, topicsData, isFlatFetching, flatContent)) {
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
  const rawItems = selectScholarItems(selectedTopicId, topicsData, flatContent);
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
