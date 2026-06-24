"use client";

import type { ScholarContentItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import Link from "next/link";
import { useState } from "react";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./scholar-content-list.module.css";

export type ScholarContentListProps = {
  items: ScholarContentItemDto[];
};

function contentHref(item: ScholarContentItemDto): string {
  if (item.type === "series") return `/series/${item.id}`;
  if (item.type === "collection") return `/collections/${item.id}`;
  return `/lectures/${item.id}`;
}

export function ScholarContentList({ items }: ScholarContentListProps) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const [filter, setFilter] = useState("");

  const featured = items[0];
  if (!featured) {
    return <p className={styles.empty}>{t("scholarContent.empty", "No published content yet.")}</p>;
  }

  const rest = items.slice(1);
  const recommended = rest.slice(0, 4);
  const browse = rest.slice(4);
  const filteredBrowse = filter
    ? browse.filter((i) =>
        pickContentField(i.title, i.original?.title, showOriginal)
          .toLowerCase()
          .includes(filter.toLowerCase()),
      )
    : browse;

  const featuredTitle = pickContentField(featured.title, featured.original?.title, showOriginal);

  return (
    <div className={styles.root}>
      {/* Featured */}
      <Link href={contentHref(featured)} className={styles.featured}>
        <span className={styles.featuredType}>{featured.type}</span>
        <span className={styles.featuredTitle}>{featuredTitle}</span>
        {featured.lectureCount != null && (
          <span className={styles.featuredMeta}>
            {t("scholarContent.lectureCount", "{{count}} lectures", {
              count: featured.lectureCount,
            })}
          </span>
        )}
      </Link>

      {/* Recommended */}
      {recommended.length > 0 && (
        <div className={styles.recommended}>
          {recommended.map((item) => {
            const title = pickContentField(item.title, item.original?.title, showOriginal);
            return (
              <Link key={item.id} href={contentHref(item)} className={styles.card}>
                <span className={styles.cardType}>{item.type}</span>
                <span className={styles.cardTitle}>{title}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Browse */}
      {rest.length > 4 && (
        <div className={styles.browse}>
          <input
            className={styles.filter}
            type="text"
            placeholder={t("scholarContent.filterPlaceholder", "Filter content…")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filteredBrowse.map((item) => {
            const title = pickContentField(item.title, item.original?.title, showOriginal);
            return (
              <Link key={item.id} href={contentHref(item)} className={styles.row}>
                <span className={styles.rowType}>{item.type}</span>
                <span className={styles.rowTitle}>{title}</span>
              </Link>
            );
          })}
          {filteredBrowse.length === 0 && filter && (
            <p className={styles.noResults}>
              {t("scholarContent.noResults", 'No results for "{{filter}}"', { filter })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
