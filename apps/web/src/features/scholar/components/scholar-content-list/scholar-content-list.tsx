"use client";

import Image from "next/image";
import Link from "next/link";
import { FolderClosed, BookOpen, Play, ChevronRight } from "lucide-react";
import type { ScholarContentItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import { useScholarTopics, useScholarContent } from "@sd/domain-content";
import styles from "./scholar-content-list.module.css";

export type ScholarContentListProps = {
  slug: string;
};

function contentHref(item: ScholarContentItemDto): string {
  if (item.type === "series") return `/series/${item.id}`;
  if (item.type === "collection") return `/collections/${item.id}`;
  return `/lectures/${item.id}`;
}

function ContentRow({ item }: { item: ScholarContentItemDto }) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();

  const title = pickContentField(item.title, item.original?.title, showOriginal);

  const getMetadataText = () => {
    const typeLabel =
      item.type === "series"
        ? t("scholarContent.typeSeries", "Series")
        : item.type === "collection"
          ? t("scholarContent.typeCollection", "Collection")
          : t("scholarContent.typeSingle", "Single");

    if (item.type !== "single" && item.lectureCount != null) {
      return t("scholarContent.metadataWithCount", "{{type}} · {{count}} lectures", {
        type: typeLabel,
        count: item.lectureCount,
      });
    }
    return typeLabel;
  };

  return (
    <Link href={contentHref(item)} className={`${styles.row} listRow`}>
      <div className={styles.iconSection}>
        {item.coverImageUrl ? (
          <Image
            src={item.coverImageUrl}
            alt=""
            width={48}
            height={48}
            unoptimized
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.fallbackIcon}>
            {item.type === "collection" ? (
              <FolderClosed size={20} />
            ) : item.type === "series" ? (
              <BookOpen size={20} />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
          </div>
        )}
      </div>

      <div className={styles.centerSection}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.metadata}>{getMetadataText()}</span>
      </div>

      <div className={styles.rightSection}>
        <ChevronRight size={20} className={styles.chevron} />
      </div>
    </Link>
  );
}

export function ScholarContentList({ slug }: ScholarContentListProps) {
  const { t } = useTranslation();
  const { data: topicsData, isFetching: isTopicsFetching } = useScholarTopics(slug);
  const hasTopics = (topicsData?.topics?.length ?? 0) > 0;

  // Flat-list fallback: only fetch when topics are empty
  const { data: flatContent, isFetching: isFlatFetching } = useScholarContent(slug);

  if (isTopicsFetching) {
    return <p className={styles.empty}>{"Loading…"}</p>;
  }

  // Topic-grouped display — sort alphabetically by topicName for consistent ordering
  if (hasTopics && topicsData) {
    const sortedTopics = [...topicsData.topics].sort((a, b) =>
      a.topicName.localeCompare(b.topicName),
    );
    return (
      <div className={styles.root}>
        {sortedTopics.map((topic) => (
          <div key={topic.topicId} className={styles.topicSection}>
            <h2 className={styles.topicHeader}>{topic.topicName}</h2>
            <div className={styles.list}>
              {topic.items.map((item) => (
                <ContentRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Graceful fallback: flat list for scholars without topic tags
  if (isFlatFetching) {
    return <p className={styles.empty}>{"Loading…"}</p>;
  }

  const flatItems = flatContent?.items ?? [];

  if (flatItems.length === 0) {
    return (
      <p className={styles.empty}>{t("scholarContent.empty", "No published content yet.")}</p>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.list}>
        {flatItems.map((item) => (
          <ContentRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
