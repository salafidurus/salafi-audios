"use client";

import { useEffect, useMemo, useRef } from "react";
import type { RecommendationItem } from "@/features/home/types/home.types";
import { RecommendationCard } from "@/features/home/components/recommendations/card/card";
import styles from "./row.module.css";

type RowProps = {
  title: string;
  items: RecommendationItem[];
  variant?: "featured";
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  pageSize?: number;
};

export function RecommendationRow({
  title,
  items,
  variant,
  hasMore,
  isLoading,
  onLoadMore,
  pageSize = 6,
}: RowProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const showSkeletons = Boolean(isLoading);
  const skeletonCount = useMemo(() => (variant === "featured" ? 2 : pageSize), [variant, pageSize]);

  useEffect(() => {
    if (!onLoadMore || !hasMore) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (isLoading) return;
        onLoadMore();
      },
      { rootMargin: "0px 120px 0px 120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <section className={styles.row} aria-label={title}>
      <div className={styles.head}>
        <h2>{title}</h2>
      </div>
      {items.length === 0 ? (
        <div className={styles.empty}>No items yet.</div>
      ) : (
        <div
          className={`${styles.scroller} ${variant === "featured" ? styles.scrollerFeatured : ""}`.trim()}
          role="list"
        >
          {items.map((item) => (
            <RecommendationCard key={item.id} item={item} variant={variant} />
          ))}
          {showSkeletons
            ? Array.from({ length: skeletonCount }).map((_, idx) => (
                <div
                  key={`skeleton-${title}-${idx}`}
                  className={`${styles.skeletonCard} ${
                    variant === "featured" ? styles.skeletonCardFeatured : ""
                  }`.trim()}
                  aria-hidden="true"
                />
              ))
            : null}
          {hasMore ? <div ref={loadMoreRef} className={styles.loadMoreSentinel} /> : null}
        </div>
      )}
    </section>
  );
}
